let { createApi } = require('unsplash-js');
const fetch = require('node-fetch'); // Requerido para Node.js
let Jimp = require('jimp'); // Asegúrate de que esta línea es correcta
const fs = require('fs');
let { facts } = require('./facts');

// Genera una imagen con un dato curioso
async function generateImage(imagePath) {
  try {
    const fact = randomFact();
    const photo = await getRandomImage(fact.animal);
    console.log(photo);
    await editImage(photo, imagePath, fact.fact);
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Obtiene un dato curioso aleatorio
function randomFact() {
  return facts[randomInteger(0, facts.length - 1)];
}

// Genera un número aleatorio entre dos valores
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Obtiene una imagen aleatoria de Unsplash basada en un animal
async function getRandomImage(animal) {
  try {
    const client = createApi({
      accessKey: process.env.UNSPLASH_API_KEY,
      fetch, // Necesario para Node.js
    });

    const response = await client.search.getPhotos({
      query: animal,
      perPage: 10,
    });

    if (!response.response || !response.response.results.length) {
      throw new Error('No images found');
    }

    const images = response.response.results;
    return images[randomInteger(0, images.length - 1)];
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

async function editImage(image, imagePath, fact) {
    try {
      let imgURL = image.urls.small;
      console.log("Cargando imagen desde URL:", imgURL);
  
      // Leer la imagen desde la URL
      let animalImage = await Jimp.read(imgURL).catch(error => {
        throw new Error(`Error al cargar la imagen: ${error}`);
      });
  
      // Dimensiones de la imagen
      let animalImageWidth = animalImage.bitmap.width;
      let animalImageHeight = animalImage.bitmap.height;
  
      // Crear un filtro oscuro
      let imgDarkener = new Jimp(animalImageWidth, animalImageHeight, '#000000');
      imgDarkener = await imgDarkener.opacity(0.5);
  
      // Superponer el filtro oscuro a la imagen original
      animalImage = await animalImage.composite(imgDarkener, 0, 0);
  
      // Cargar la fuente para agregar el texto (puedes cambiar el tipo de fuente según necesites)
      let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  
      // Añadir el texto del dato curioso en la imagen
      let posX = animalImageWidth / 15;
      let posY = animalImageHeight / 15;
      let maxWidth = animalImageWidth - (posX * 2);
      let maxHeight = animalImageHeight - posY;
  
      await animalImage.print(
        font,
        posX,
        posY,
        {
          text: fact,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        maxWidth,
        maxHeight
      );
  
      // Guardar la imagen editada en el disco
      await animalImage.writeAsync(imagePath);
      console.log(`Imagen guardada en: ${imagePath}`);
    } catch (error) {
      console.log("Error al editar la imagen:", error);
    }
  }

  
// Borra la imagen temporal generada
const deleteImage = (imagePath) => {
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return;
    }
    console.log('File deleted successfully');
  });
};

module.exports = { generateImage, deleteImage };
