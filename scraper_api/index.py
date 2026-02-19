from flask import Flask, request, jsonify
import requests
import sys
import re
from bs4 import BeautifulSoup
import cloudinary
import cloudinary.uploader
from urllib.parse import urlparse
import os
import concurrent.futures
import time
from functools import lru_cache
import logging
from requests.adapters import HTTPAdapter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

TMDB_BEARER_TOKEN = os.getenv('TMDB_BEARER_TOKEN', 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2YjljMGQ1ZTJhYTk0OTVjZTQzZmY4MzQyNTNjYmRjOCIsIm5iZiI6MS43NDYzNDIyMDIyNTQwMDAyZSs5LCJzdWIiOiI2ODE3MTEzYWVlOGFlODcwZWQ4NGNmZDEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.6rfRRKkn7eqsUv1VwIifWCehwT3f-YwK-6KV7x1kfx8')

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'dshmvyjgf'),
    api_key=os.getenv('CLOUDINARY_API_KEY', '832587935596469'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET', '5DPNHukMTr1agmI0nowrDTJuHRQ')
)

# Request headers - define once and reuse
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# Scraper Session (for mkvking.fans)
scraper_session = requests.Session()

# Mapping for site-specific slugs that don't follow the default pattern
# (e.g., lowercase + hyphen). This makes the slug discovery more "dynamic"
# by handling exceptions centrally.
GENRE_MAP = {
    "sci-fi": "science-fiction",
    "science fiction": "science-fiction",
    "scifi": "science-fiction",
    "tv show": "tv-show",
    "tv shows": "tv-show"
}

def get_slug(text):
    """Helper to convert text to site-compatible slug"""
    if not text:
        return ""
    text_lower = str(text).lower().strip()
    return GENRE_MAP.get(text_lower, text_lower.replace(" ", "-"))

# Shared configuration for scraper
API_URL = "https://mkvking.fans/wp-admin/admin-ajax.php"
BASE_URL = "https://mkvking.fans/"
AJAX_URL = "https://mkvking.fans/wp-admin/admin-ajax.php"
scraper_adapter = HTTPAdapter(pool_connections=16, pool_maxsize=20)
scraper_session.mount("http://", scraper_adapter)
scraper_session.mount("https://", scraper_adapter)
scraper_session.headers.update(HEADERS)
scraper_session.headers.update({"Referer": "https://mkvking.fans/"})

# TMDB Session (for api.themoviedb.org)
tmdb_session = requests.Session()
tmdb_adapter = HTTPAdapter(pool_connections=10, pool_maxsize=15)
tmdb_session.mount("https://", tmdb_adapter)
tmdb_session.headers.update({"accept": "application/json"})

# Base URLs
BASE_URL = "https://mkvking.fans/"
AJAX_URL = f"{BASE_URL}wp-admin/admin-ajax.php"

def clean_movie_name(name):
    """Remove site name and trailing year info"""
    if not name: return ""
    # Remove site branding
    name = re.sub(r'\s*-\s*Mkvking\.com.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*Mkvking\.com\s*Official.*$', '', name, flags=re.IGNORECASE)
    # Remove a trailing year in parentheses OR without, only if it's at the end
    return re.sub(r'\s*(\(\d{4}\)|\d{4})\s*$', '', name).strip()

@lru_cache(maxsize=128)
def fetch_tmdb_data(name, year=None):
    """Fetch movie or TV data from TMDB API including images, genres, ratings, and runtime"""
    try:
        headers = {
            "Authorization": f"Bearer {TMDB_BEARER_TOKEN}",
            "accept": "application/json"
        }

        def get_tmdb_results(type="movie", search_params=None):
            url = f"https://api.themoviedb.org/3/search/{type}"
            response = tmdb_session.get(url, headers=headers, params=search_params, timeout=10)
            if response.status_code == 200:
                return response.json().get("results", [])
            return []

        # 1. Try Movie search
        params = {"query": name}
        if year: params["primary_release_year"] = year
        results = get_tmdb_results("movie", params)

        # 2. Retry Movie without year
        if not results and year:
            results = get_tmdb_results("movie", {"query": name})

        # 3. Try TV search (Series)
        if not results:
            tv_params = {"query": name}
            if year: tv_params["first_air_date_year"] = year
            results = get_tmdb_results("tv", tv_params)
            
            if not results and year:
                results = get_tmdb_results("tv", {"query": name})
            
            if results:
                # It's a TV show
                tv = results[0]
                tv_id = tv.get("id")
                logger.info(f"Found TMDB TV match for '{name}': {tv.get('name')} (ID: {tv_id})")
                
                details_url = f"https://api.themoviedb.org/3/tv/{tv_id}"
                details_response = tmdb_session.get(details_url, headers=headers, timeout=10)
                details = details_response.json() if details_response.status_code == 200 else {}
                
                poster_path = tv.get("poster_path")
                backdrop_path = tv.get("backdrop_path")
                
                return {
                    "tmdb_id": f"tv/{tv_id}",
                    "tmdb_poster": f"https://image.tmdb.org/t/p/w780{poster_path}" if poster_path else None,
                    "tmdb_backdrop": f"https://image.tmdb.org/t/p/w1280{backdrop_path}" if backdrop_path else None,
                    "tmdb_genres": [g.get("name") for g in details.get("genres", [])] if details else [],
                    "tmdb_rating": tv.get("vote_average"),
                    "tmdb_runtime": details.get("episode_run_time", [None])[0] if details.get("episode_run_time") else None,
                    "tmdb_overview": tv.get("overview"),
                    "tmdb_release_date": tv.get("first_air_date")
                }

        # Handle Movie results
        if results:
            movie = results[0]
            movie_id = movie.get("id")
            logger.info(f"Found TMDB Movie match for '{name}': {movie.get('title')} (ID: {movie_id})")
            
            details_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
            details_response = tmdb_session.get(details_url, headers=headers, timeout=10)
            details = details_response.json() if details_response.status_code == 200 else {}

            poster_path = movie.get("poster_path")
            backdrop_path = movie.get("backdrop_path")
            
            return {
                "tmdb_id": movie_id,
                "tmdb_poster": f"https://image.tmdb.org/t/p/w780{poster_path}" if poster_path else None,
                "tmdb_backdrop": f"https://image.tmdb.org/t/p/w1280{backdrop_path}" if backdrop_path else None,
                "tmdb_genres": [g.get("name") for g in details.get("genres", [])] if details else [],
                "tmdb_rating": movie.get("vote_average"),
                "tmdb_runtime": details.get("runtime"),
                "tmdb_overview": movie.get("overview"),
                "tmdb_release_date": movie.get("release_date")
            }

    except Exception as e:
        logger.error(f"Error fetching TMDB data for '{name} ({year})': {e}")

    return {
        "tmdb_id": None, "tmdb_poster": None, "tmdb_backdrop": None, "tmdb_genres": [], 
        "tmdb_rating": None, "tmdb_runtime": None, "tmdb_overview": None, "tmdb_release_date": None
    }

@lru_cache(maxsize=64)
def upload_to_cloudinary(image_url):
    """Upload mkvking poster images to Cloudinary with caching"""
    try:
        # Extract filename from image_url
        parsed_url = urlparse(image_url)
        filename = os.path.basename(parsed_url.path)
        name_without_ext = os.path.splitext(filename)[0]

        # Check if we've already uploaded this image (by URL as key)
        upload_result = cloudinary.uploader.upload(
            image_url,
            folder="cinebucket/posters",
            public_id=name_without_ext,
            overwrite=True,
            resource_type="image"
        )
        return upload_result.get('secure_url')
    except Exception as e:
        logger.error(f"Cloudinary upload failed for {image_url}: {e}")
        return None

def extract_post_id(soup):
    """Extract post ID from article tag or body class"""
    article_tag = soup.find("article")
    if article_tag:
        article_id = article_tag.get("id")
        if article_id and article_id.startswith("post-"):
            return article_id.replace("post-", "")
    
    # Fallback to body class
    body_tag = soup.find("body")
    if body_tag:
        body_classes = body_tag.get("class", [])
        for cls in body_classes:
            if cls.startswith("postid-"):
                return cls.replace("postid-", "")
            
    return None

def fetch_iframe_src(post_id):
    """Fetch iframe source via AJAX request"""
    if not post_id:
        return None
    
    form_data = {
        "action": "muvipro_player_content",
        "tab": "player2",
        "post_id": post_id
    }
    
    try:
        ajax_response = scraper_session.post(AJAX_URL, data=form_data, timeout=10)
        if ajax_response.status_code == 200:
            iframe_soup = BeautifulSoup(ajax_response.text, "html.parser")
            iframe_tag = iframe_soup.find("iframe")
            if iframe_tag and iframe_tag.get("src"):
                return iframe_tag.get("src")
    except Exception as e:
        logger.error(f"Error fetching iframe for post {post_id}: {e}")
    
    return None

def fetch_iqsmart_download_links(tmdb_id):
    """Fetch direct player links from iqsmartgames API as a fallback"""
    if not tmdb_id:
        return []
    
    url = f"https://stream.iqsmartgames.com/movieapi.php?tmdbid={tmdb_id}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": f"https://stream.iqsmartgames.com/movlinks.php?tmdbid={tmdb_id}"
    }
    
    try:
        response = scraper_session.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data.get("data"):
                links = []
                for item in data["data"]:
                    links.append({
                        "label": f"Direct ({item.get('fsize', 'Unknown')})",
                        "url": f"https://pro.iqsmartgames.com/embed/{item.get('fileslug')}"
                    })
                return links
    except Exception as e:
        logger.error(f"Error fetching iqsmart links for {tmdb_id}: {e}")
    
    return []

def parse_movie_page(soup, movie_url):
    """Parse the HTML soup object to extract movie details"""
    movie_data = {
        "url": movie_url,
        "poster": None,
        "backdrop_path": None,
        "poster_alt": None,
        "name": None,
        "genre": [],
        "tags": [],
        "quality": None,
        "year": None,
        "duration": None,
        "rating": None,
        "iframe_src": None,
        "description": None,
        "release_date": None,
        "language": None,
        "download_links": []
    }
    
    movie_data["genre"] = []
    movie_data["tags"] = []
    movie_data["download_links"] = []
    
    # 1. Extract name and year from Title Tag first (often the most reliable on protected pages)
    title_tag = soup.find("title")
    if title_tag:
        raw_title = title_tag.text.split("|")[0].split(" - ")[0].strip()
        movie_data["name"] = clean_movie_name(raw_title)
        year_match = re.search(r'\((\d{4})\)', raw_title)
        if year_match:
            movie_data["year"] = int(year_match.group(1))

    # 2. Extract poster image from meta tags (often visible even on protected pages)
    og_image = soup.find("meta", attrs={"property": "og:image"})
    if og_image:
        movie_data["poster"] = og_image.get("content")
    else:
        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        if twitter_image:
            movie_data["poster"] = twitter_image.get("content")

    # 3. Extract description from meta tags
    og_desc = soup.find("meta", attrs={"property": "og:description"})
    if og_desc:
        movie_data["description"] = og_desc.get("content")
    else:
        meta_desc = soup.find("meta", attrs={"name": "description"})
        if meta_desc:
            movie_data["description"] = meta_desc.get("content")

    # Protected page detection (Shorty protection wall)
    # If detected, we return early but with the meta data we already found
    is_protected = any(x in str(soup.text) for x in ["Protected page detected", "Skip Ad To Watch", "gmr-protection-wall"])
    if is_protected:
        logger.warning(f"Protected page detected for {movie_url}. Attempting metadata extraction.")

    # Extract poster image from figure if not found in meta
    if not movie_data["poster"]:
        content_thumbnail = soup.find("figure", class_="pull-left")
        if content_thumbnail:
            img_tag = content_thumbnail.find("img")
            if img_tag:
                raw_src = img_tag.get("src")
                if raw_src:
                    clean_src = re.sub(r'-\d+x\d+(?=\.(jpg|jpeg|png))', '', raw_src)
                    movie_data["poster"] = clean_src
                    movie_data["poster_alt"] = img_tag.get("alt")

    # Extract movie title
    entry_title = soup.find("h1", class_="entry-title")
    if entry_title:
        movie_data["name"] = clean_movie_name(entry_title.text.strip())
        # Try to extract year from the title if it's there
        year_match = re.search(r'\((\d{4})\)', entry_title.text)
        if year_match:
            movie_data["year"] = int(year_match.group(1))
    else:
        # Fallback to meta tags
        og_title = soup.find("meta", attrs={"property": "og:title"})
        if og_title:
            name = og_title.get("content", "").replace(" Full Movie", "").replace(" Movie Download", "").strip()
            # Remove quality/encoding usually at the end of og:title
            name = re.sub(r'\s+(WEB-DL|BluRay|HDRip|480p|720p|1080p|Full Movie).*$', '', name, flags=re.IGNORECASE)
            # Remove site branding
            name = re.sub(r'\s*-\s*Mkvking\.com.*$', '', name, flags=re.IGNORECASE)
            movie_data["name"] = name
        else:
            og_title = soup.find("meta", attrs={"name": "twitter:title"})
            if og_title:
                movie_data["name"] = og_title.get("content")
            else:
                title_tag = soup.find("title")
                if title_tag:
                    movie_data["name"] = title_tag.text.split(" (")[0].strip()

    # Extract genres
    movie_data["genre"] = []
    gmr_movie_on = soup.find("span", class_="gmr-movie-genre")
    if gmr_movie_on:
        for a in gmr_movie_on.find_all("a", rel="category tag"):
            movie_data["genre"].append(a.text.strip())

    # Extract quality
    movie_data["quality"] = None
    gmr_movie_quality = soup.find("span", class_="gmr-movie-quality")
    if gmr_movie_quality:
        a_tag = gmr_movie_quality.find("a")
        if a_tag:
            movie_data["quality"] = a_tag.text.strip()
    
    # Try to guess quality from title if missing
    if not movie_data["quality"]:
        full_text = f"{soup.find('title').text if soup.find('title') else ''} {movie_data['name'] or ''}"
        quality_match = re.search(r'(480p|720p|1080p|2160p|4k|WEB-DL|BluRay|HDRip|HDCAM|CAM)', full_text, re.IGNORECASE)
        if quality_match:
            movie_data["quality"] = quality_match.group(0).upper()

    # Extract duration
    movie_data["duration"] = None
    duration_span = soup.find("span", class_="gmr-movie-runtime")
    if duration_span:
        movie_data["duration"] = duration_span.text.strip()

    # Extract rating
    movie_data["rating"] = None
    rating_value_span = soup.find("span", itemprop="ratingValue")
    if rating_value_span:
        try:
            movie_data["rating"] = float(rating_value_span.text.strip())
        except (ValueError, TypeError):
            pass

    # Extract description
    movie_data["description"] = None
    description_div = soup.find("div", class_="entry-content entry-content-single", itemprop="description")
    if description_div:
        first_paragraph = description_div.find("p")
        if first_paragraph:
            movie_data["description"] = first_paragraph.text.strip()
    
    if not movie_data["description"]:
        for meta_name in ["og:description", "description"]:
            tag = soup.find("meta", attrs={"property" if "og:" in meta_name else "name": meta_name})
            if tag and tag.get("content"):
                movie_data["description"] = tag.get("content")
                break

    # Extract release date and year
    movie_data["release_date"] = None
    time_tag = soup.find("time")
    if time_tag and time_tag.text:
        movie_data["release_date"] = time_tag.text.strip()
        rd = movie_data["release_date"]
        if rd:
            parts = rd.split()
            if len(parts) > 2 and str(parts[-1]).isdigit():
                movie_data["year"] = int(parts[-1])

    # Extract language
    movie_data["language"] = None
    language_span = soup.find("span", property="inLanguage")
    if language_span:
        movie_data["language"] = language_span.text.strip()

    # Extract tags
    movie_data["tags"] = []
    tags_span = soup.find("span", class_="tags-links")
    if tags_span:
        for a in tags_span.find_all("a", rel="tag"):
            tag_text = a.text.strip()
            if tag_text and tag_text.lower() not in ["movie", "download", "mkvking"]:
                movie_data["tags"].append(tag_text)
    
    # Final Fallback for Tags: Use Keywords from description if still empty
    if not isinstance(movie_data.get("tags"), list):
        movie_data["tags"] = []

    if not movie_data["tags"] and movie_data.get("description"):
        desc = str(movie_data["description"])
        potential_tags = [w.strip(",.()\"").capitalize() for w in desc.split()[:30] if len(w) > 4]
        movie_data["tags"] = potential_tags[:8]

    # Extract download links
    if movie_data["download_links"] is None: movie_data["download_links"] = []
    download_div = soup.find("div", id="download")
    if download_div:
        for li in download_div.find_all("li"):
            a_tag = li.find("a")
            if a_tag:
                # Try to extract quality from span before it's gone
                quality_tag = a_tag.find("span")
                quality_prefix = f"[{quality_tag.text.strip()}] " if quality_tag else ""
                
                # Clone for text extraction if needed, but here we just get text
                raw_label = a_tag.get_text(separator=" ", strip=True)
                
                logger.debug(f"Extracted link label: {raw_label}")
                movie_data["download_links"].append({
                    "label": raw_label,
                    "url": a_tag.get("href")
                })
    
    return movie_data

def search_movie_on_site(query):
    """Search for a movie on the site by name if direct slug fails"""
    try:
        search_url = f"{BASE_URL}?s={requests.utils.quote(query)}"
        response = scraper_session.get(search_url, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            first_result = soup.select_one("article.post h2.entry-title a")
            if first_result:
                return first_result.get("href")
    except Exception as e:
        logger.error(f"Search error for '{query}': {e}")
    return None

def fetch_movie_details(movie_url):
    """Fetch full movie details from a movie's page with improved error handling"""
    try:
        start_time = time.time()
        response = scraper_session.get(movie_url, timeout=15)
        
        # Fallback to search if 404
        if response.status_code == 404:
            slug = movie_url.strip("/").split("/")[-1]
            query = slug.replace("-", " ")
            logger.info(f"404 detected for {slug}, trying search for '{query}'")
            new_url = search_movie_on_site(query)
            if new_url and new_url != movie_url:
                logger.info(f"Redirecting from {movie_url} to {new_url}")
                response = scraper_session.get(new_url, timeout=15)
            else:
                return None

        if response.status_code != 200:
            logger.warning(f"Failed to fetch movie: {movie_url}, Status: {response.status_code}")
            return None
        

        soup = BeautifulSoup(response.text, "html.parser")
        
        # Parse movie data from HTML
        movie_data = parse_movie_page(soup, movie_url)
        
        if not movie_data["name"]:
            logger.error(f"Failed to extract name from {movie_url}. Body snippet: {response.text[:200]}")
        
        # Extract post_id and fetch iframe source
        post_id = extract_post_id(soup)
        movie_data["iframe_src"] = fetch_iframe_src(post_id)
        
        # Get TMDB data if we have a movie name
        if movie_data["name"]:
            movie_name = clean_movie_name(str(movie_data["name"]))
            movie_year = movie_data.get("year")
            
            # TMDB fetch
            tmdb_data = fetch_tmdb_data(movie_name, int(str(movie_year)) if movie_year and str(movie_year).isdigit() else None)
            
            # Enrich data from TMDB
            # Use TMDB poster if available
            if tmdb_data and tmdb_data.get("tmdb_poster"):
                movie_data["poster"] = tmdb_data["tmdb_poster"]
            elif movie_data["poster"] and "mkvking" in str(movie_data["poster"]):
                cloudinary_url = upload_to_cloudinary(str(movie_data["poster"]))
                if cloudinary_url:
                    movie_data["poster"] = cloudinary_url
            
            # Add backdrop from TMDB
            if tmdb_data:
                movie_data["backdrop_path"] = tmdb_data.get("tmdb_backdrop")
            
            # Restore iframe_src from iqsmartgames if missing
            if tmdb_data and not movie_data["iframe_src"] and tmdb_data.get("tmdb_id"):
                movie_data["iframe_src"] = f"https://stream.iqsmartgames.com/movlinks.php?tmdbid={tmdb_data['tmdb_id']}"
            
            # Add iqsmartgames download links as direct fallbacks
            if tmdb_data and tmdb_data.get("tmdb_id"):
                tmdb_lookup_id = tmdb_data["tmdb_id"]
                if isinstance(tmdb_lookup_id, str) and tmdb_lookup_id.startswith("tv/"):
                    tmdb_lookup_id = tmdb_lookup_id.split("/")[-1]
                
                iq_links = fetch_iqsmart_download_links(tmdb_lookup_id)
                if iq_links:
                    if not isinstance(movie_data.get("download_links"), list):
                        movie_data["download_links"] = []
                    
                    for iq_link in iq_links:
                        # Existing links check
                        is_duplicate = False
                        for existing in movie_data["download_links"]:
                            if isinstance(existing, dict) and existing.get("url") == iq_link.get("url"):
                                is_duplicate = True
                                break
                        if not is_duplicate:
                            movie_data["download_links"].append(iq_link)

            # Fill missing details from TMDB with safety checks
            if tmdb_data:
                if (not movie_data["genre"] or len(movie_data["genre"]) == 0) and tmdb_data.get("tmdb_genres"):
                    movie_data["genre"] = tmdb_data["tmdb_genres"]
                
                if (not movie_data["rating"]) and tmdb_data.get("tmdb_rating"):
                    movie_data["rating"] = tmdb_data["tmdb_rating"]
                    
                if (not movie_data["duration"]) and tmdb_data.get("tmdb_runtime"):
                    movie_data["duration"] = f"{tmdb_data['tmdb_runtime']} min"
                    
                if (not movie_data["description"]) and tmdb_data.get("tmdb_overview"):
                    movie_data["description"] = tmdb_data["tmdb_overview"]
                    
                if (not movie_data["release_date"]) and tmdb_data.get("tmdb_release_date"):
                    movie_data["release_date"] = tmdb_data["tmdb_release_date"]
                    if not movie_year:
                        try:
                            movie_data["year"] = int(str(tmdb_data["tmdb_release_date"]).split("-")[0])
                        except (ValueError, IndexError):
                            pass
        
        logger.info(f"Movie fetched in {time.time() - start_time:.2f}s: {movie_data['name']}")
        return movie_data
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching movie: {movie_url}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error fetching movie: {movie_url}, Error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching movie: {movie_url}, Error: {e}")
    
    return None

def get_movie_urls_from_page(page_url):
    """Extract all movie URLs and total page count from a page"""
    try:
        response = scraper_session.get(page_url, timeout=15)
        if response.status_code != 200:
            logger.warning(f"Failed to fetch Page {page_url}: Status {response.status_code}")
            return [], 0

        soup = BeautifulSoup(response.text, "html.parser")
        
        # Extract total pages from pagination
        total_pages = 1
        pagination = soup.select_one('ul.page-numbers')
        if pagination:
            page_links = pagination.find_all('a', class_='page-numbers')
            for link in page_links:
                try:
                    # Remove commas and convert to int
                    num = int(link.text.replace(',', ''))
                    if num > total_pages:
                        total_pages = num
                except ValueError:
                    continue

        articles = soup.find_all(["article", "div"], 
                                class_=re.compile(r"gmr-item-modulepost|item-article|col-md-125|gmr-slider-item"))
        
        if not articles:
            articles = soup.find_all("div", attrs={"itemtype": "https://schema.org/Movie"})
        
        urls = []
        for article in articles:
            a_tag = (article.find("a", rel="bookmark") or 
                     article.find("h2", class_="entry-title").find("a") if article.find("h2", class_="entry-title") else None or
                     article.find("h3", class_="gmr-slider-title").find("a") if article.find("h3", class_="gmr-slider-title") else None or
                     article.find("a"))
                 
            if a_tag and a_tag.get("href"):
                url = a_tag.get("href")
                if "/author/" in url or "/category/" in url or "/tag/" in url:
                    continue
                if url not in urls and url.startswith(BASE_URL):
                    urls.append(url)

        return urls, total_pages
    except Exception as e:
        logger.error(f"Error getting movie URLs from page {page_url}: {e}")
        return [], 0

@app.route('/api/movies', methods=['POST'])
def get_movies_from_page():
    """API endpoint to fetch movies with support for pagination and search"""
    start_time = time.time()
    data = request.get_json() or {}

    # Extract parameters with defaults to match frontend expectations
    start = data.get('start', 0)
    limit = data.get('limit', 20)
    search_query = data.get('search_query', "")
    max_workers = data.get('max_workers', 8)

    # Calculate page number for the scraper based on start/limit
    page = (start // limit) + 1 if limit > 0 else 1
    
    # Construct target URL
    if search_query:
        if page == 1:
            page_url = f"{BASE_URL}?s={search_query}"
        else:
            page_url = f"{BASE_URL}page/{page}/?s={search_query}"
    else:
        if page == 1:
            page_url = BASE_URL
        else:
            page_url = f"{BASE_URL}page/{page}/"

    logger.info(f"Fulfilling request: start={start}, limit={limit}, query='{search_query}' -> URL: {page_url}")
    
    # Scrape movies from the calculated URL
    movie_urls, total_pages = get_movie_urls_from_page(page_url)
    movies = []
    
    if movie_urls:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {}
            for url in movie_urls:
                future = executor.submit(fetch_movie_details, str(url))
                future_to_url[future] = url
            
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    movie_details = future.result()
                    if movie_details:
                        # Use slug as ID: https://mkvking.fans/slug/ -> slug
                        slug = str(url).strip('/').split('/')[-1]
                        movie_details["id"] = slug
                        movies.append(movie_details)
                except Exception as e:
                    logger.error(f"Error processing {url}: {e}")

    execution_time = time.time() - start_time
    return jsonify({
        "results": movies,
        "total": total_pages * 20 if total_pages > 0 else 0,
        "total_pages": total_pages,
        "count": len(movies),
        "execution_time_seconds": round(float(execution_time), 2)
    })

@app.route('/api/search', methods=['GET'])
def search_movies_get():
    """GET version of search for frontend SWR/fetch compatibility"""
    start_time = time.time()
    
    query = request.args.get('query', '')
    genre = request.args.get('genre')
    year = request.args.get('year')
    tag = request.args.get('tag')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    max_workers = int(request.args.get('max_workers', 8))
    
    # Construct URL based on filters or search using the centralized slug map
    if query:
        # For search, the site uses ?s=query, and for page 2+ it uses /page/2/?s=query
        page_url = f"{BASE_URL}page/{page}/?s={query}" if page > 1 else f"{BASE_URL}?s={query}"
    elif tag:
        tag_slug = get_slug(tag)
        page_url = f"{BASE_URL}tag/{tag_slug}/"
        if page > 1: page_url += f"page/{page}/"
    elif genre:
        genre_slug = get_slug(genre)
        page_url = f"{BASE_URL}category/{genre_slug}/"
        if page > 1: page_url += f"page/{page}/"
    elif year:
        page_url = f"{BASE_URL}year/{year}/"
        if page > 1: page_url += f"page/{page}/"
    else:
        page_url = f"{BASE_URL}page/{page}/" if page > 1 else BASE_URL

    logger.info(f"GET Search: query='{query}', genre={genre}, year={year}, tag={tag}, page={page} -> URL: {page_url}")

    movie_urls, total_pages = get_movie_urls_from_page(page_url)
    movies = []
    
    if movie_urls:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {executor.submit(fetch_movie_details, url): url for url in movie_urls}
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    movie_details = future.result()
                    if movie_details:
                        slug = url.strip('/').split('/')[-1]
                        movie_details["id"] = slug
                        movies.append(movie_details)
                except Exception as e:
                    logger.error(f"Error processing {url}: {e}")

    execution_time = time.time() - start_time
    return jsonify({
        "results": movies,
        "total": total_pages * 20 if total_pages > 0 else 0,
        "total_pages": total_pages,
        "count": len(movies),
        "execution_time_seconds": round(float(execution_time), 2)
    })

@app.route('/api/movies/<path:movie_id>', methods=['GET'])
def get_movie_by_id(movie_id):
    """API endpoint to fetch a single movie by its slug/ID"""
    start_time = time.time()
    
    # Construct target URL from slug
    movie_url = f"{BASE_URL}{movie_id}/"
    logger.info(f"Fetching movie detail: {movie_id} -> URL: {movie_url}")
    
    movie_details = fetch_movie_details(movie_url)
    
    if not movie_details:
        return jsonify({"error": "Movie not found"}), 404
        
    movie_details["id"] = movie_id
    execution_time = time.time() - start_time
    
    return jsonify(movie_details)

@app.route('/api/filters', methods=['POST'])
def get_filtered_movies():
    """API endpoint to fetch movies by filters (genre, year, tag)"""
    start_time = time.time()
    data = request.get_json() or {}

    start = data.get('start', 0)
    limit = data.get('limit', 20)
    year = data.get('year')
    genre = data.get('genre')
    tag = data.get('tag')
    max_workers = data.get('max_workers', 8)

    page = (start // limit) + 1 if limit > 0 else 1
    
    # Construct URL based on filters using centralized slug map
    # Priority: Tag > Genre > Year
    if tag:
        tag_slug = get_slug(tag)
        page_url = f"{BASE_URL}tag/{tag_slug}/"
    elif genre:
        genre_slug = get_slug(genre)
        page_url = f"{BASE_URL}category/{genre_slug}/"
    elif year:
        page_url = f"{BASE_URL}year/{year}/"
    else:
        page_url = BASE_URL

    if page > 1:
        page_url += f"page/{page}/"

    logger.info(f"Filtering: tag={tag}, genre={genre}, year={year} -> URL: {page_url}")

    movie_urls, total_pages = get_movie_urls_from_page(page_url)
    movies = []
    
    if movie_urls:
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {executor.submit(fetch_movie_details, url): url for url in movie_urls}
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    movie_details = future.result()
                    if movie_details:
                        slug = url.strip('/').split('/')[-1]
                        movie_details["id"] = slug
                        movies.append(movie_details)
                except Exception as e:
                    logger.error(f"Error processing {url}: {e}")

    execution_time = time.time() - start_time
    return jsonify({
        "results": movies,
        "total": total_pages * 20 if total_pages > 0 else 0,
        "total_pages": total_pages,
        "count": len(movies)
    })

@app.route('/category/<slug>')
def get_category_by_slug_direct(slug):
    """Convenience endpoint to fetch a category by slug directly"""
    start_time = time.time()
    
    # Map 'recent-movies' to home page, others to category slug
    if slug == "recent-movies":
        page_url = BASE_URL
    else:
        # Use existing slug mapping logic
        mapped_slug = GENRE_MAP.get(slug.lower(), slug.lower())
        page_url = f"{BASE_URL}category/{mapped_slug}/"
        
    logger.info(f"Direct Category Request: {slug} -> URL: {page_url}")
    
    movie_urls, total_pages = get_movie_urls_from_page(page_url)
    movies = []
    
    if movie_urls:
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            future_to_url = {executor.submit(fetch_movie_details, url): url for url in movie_urls}
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    movie_details = future.result()
                    if movie_details:
                        movie_details["id"] = url.strip('/').split('/')[-1]
                        movies.append(movie_details)
                except Exception as e:
                    logger.error(f"Error processing {url}: {e}")

    execution_time = time.time() - start_time
    return jsonify({
        "results": movies,
        "total": total_pages * 20 if total_pages > 0 else 0,
        "total_pages": total_pages,
        "count": len(movies),
        "execution_time_seconds": round(float(execution_time), 2)
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": time.time()})
