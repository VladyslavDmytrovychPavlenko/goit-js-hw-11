// Імпорт необхідних модулів та таблиць стилів
import './sass/index.scss';
import { fetchPictures } from './js/pictureApiService';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Отримуєм елементи DOM і приєднуєм слухачі подій
const searchForm = document.querySelector('.search-form');
const galleryBox = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onloadMore);

// Встановити початковий стан
loadMoreBtn.classList.add('is-hidden');
let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

// Функція зворотного виклику слухача подій для подання форми пошуку
function onSearch(e) {
  e.preventDefault();
  // Скинути номер сторінки та пошуковий запит
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  // Очистити галерею та показати кнопку завантажити більше
  galleryBox.innerHTML = '';
  if (!query) {
    // Показувати повідомлення про помилку, якщо пошуковий запит порожній
    Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }
  loadMoreBtn.classList.remove('is-hidden');
  // Отримання зображень з API та обробка відповіді
  fetchPictures(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        // Показувати сповіщення про помилку, якщо зображення не знайдено
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      // Створення HTML-розмітки для галереї та ініціалізація SimpleLightbox
      createMarkup(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      }).refresh();
      // Показати сповіщення про успіх із кількістю знайдених зображень
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
    })
    .catch(error => console.log(error))
    .finally(() => {
      // Скидання форми пошуку
      searchForm.reset();
    });
}

// Функція зворотного виклику слухача подій для натискання кнопки завантаження більше
function onloadMore() {
  // Збільшити номер сторінки та знищити SimpleLightbox
  page += 1;
  simpleLightBox.destroy();
  // Отримати більше зображень з API та обробити відповідь
  fetchPictures(query, page, perPage)
    .then(({ data }) => {
      // Створіть розмітку HTML для нових зображень і оновіть SimpleLightbox
      createMarkup(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
      }).refresh();
      // Приховати кнопку завантаження додаткових відомостей і показати сповіщення про помилку, якщо досягнуто кінця результатів пошуку
      const totalPages = Math.ceil(data.totalHits / perPage);
      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}
function createMarkup(hits) {
  console.log(`Rendering...`);
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
