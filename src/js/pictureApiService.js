import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const KEY = '34889854-1af62613b01e34ca3c220e7a9';

export async function fetchPictures(query, page, perPage) {
  try {
    const response = await axios.get(
      `?key=${KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}
// export { fetchPictures };
