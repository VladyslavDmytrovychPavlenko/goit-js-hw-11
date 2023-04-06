import './sass/index.scss';
import { fetchPictures } from './js/pictureApiService';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('.search-form');
const galleryBox = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.classList.add('is-hiden');
searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onloadMore);

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

async function onSearch(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  console.log(query);
  galleryBox.innerHTML = '';

  loadMoreBtn.classList.add('is-hiden');
  try {
    const { data, hits, totalHits } = await fetchPictures(query, page, perPage);
    console.log(hits);
    console.log(totalHits);
    if (!query || totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      loadMoreBtn.classList.add('is-hiden');
      galleryBox.innerHTML = '';
      return;
    } else if (hits.length < 40) {
      createMarkup(hits);
      simpleLightBox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      }).refresh();
      Notify.success(`Hooray! We found ${totalHits} images.`);
      loadMoreBtn.classList.add('is-hiden');
      Notify.info("We're sorry, but you've reached the end of search results.");
    } else if (page > totalHits / perPage) {
      loadMoreBtn.classList.add('is-hiden');
      Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      createMarkup(hits);
      simpleLightBox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      }).refresh();
      Notify.success(`Hooray! We found ${totalHits} images.`);
      loadMoreBtn.classList.remove('is-hiden');
      searchForm.reset();
    }
  } catch (error) {
    console.log(error);
  }
}

async function onloadMore() {
  page += 1;
  simpleLightBox.destroy();
  try {
    const { hits, totalHits } = await fetchPictures(query, page, perPage);

    createMarkup(hits);
    simpleLightBox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    }).refresh();
    if (page > totalHits / perPage) {
      loadMoreBtn.classList.add('is-hiden');
      Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.log(error);
  }
}
function createMarkup(hits) {
  const markup = hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery__item" href="${largeImageURL}">
       <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" width = "300" height="200" loading="lazy" />
          <div class="info">
          <p class="info-item"><b>Likes</b>${likes}</p>
          <p class="info-item"><b>Views</b>${views}</p>
          <p class="info-item"><b>Comments</b>${comments}</p>
          <p class="info-item"><b>Downloads</b>${downloads}</p>
          </div>
       </div>
     </a>`;
      }
    )
    .join('');
  galleryBox.insertAdjacentHTML('beforeend', markup);
}
