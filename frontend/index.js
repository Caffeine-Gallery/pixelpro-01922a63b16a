import { backend } from 'declarations/backend';

let canvas, ctx, image;
let brightness = 0, contrast = 0, saturation = 0;
let isCropping = false, cropStartX, cropStartY, cropEndX, cropEndY;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    document.getElementById('brightness').addEventListener('input', updateImage);
    document.getElementById('contrast').addEventListener('input', updateImage);
    document.getElementById('saturation').addEventListener('input', updateImage);
    document.getElementById('cropBtn').addEventListener('click', toggleCrop);
    document.getElementById('saveBtn').addEventListener('click', saveImage);

    canvas.addEventListener('mousedown', startCrop);
    canvas.addEventListener('mousemove', drawCrop);
    canvas.addEventListener('mouseup', endCrop);
});

function handleImageUpload(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        image = new Image();
        image.onload = function() {
            canvas.width = image.width;
            canvas.height = image.height;
            updateImage();
        }
        image.src = event.target.result;
    }

    reader.readAsDataURL(file);
}

function updateImage() {
    brightness = parseInt(document.getElementById('brightness').value);
    contrast = parseInt(document.getElementById('contrast').value);
    saturation = parseInt(document.getElementById('saturation').value);

    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function toggleCrop() {
    isCropping = !isCropping;
    document.getElementById('cropBtn').textContent = isCropping ? 'Finish Crop' : 'Crop';
}

function startCrop(e) {
    if (!isCropping) return;
    const rect = canvas.getBoundingClientRect();
    cropStartX = e.clientX - rect.left;
    cropStartY = e.clientY - rect.top;
}

function drawCrop(e) {
    if (!isCropping || !cropStartX) return;
    const rect = canvas.getBoundingClientRect();
    cropEndX = e.clientX - rect.left;
    cropEndY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateImage();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropStartX, cropStartY, cropEndX - cropStartX, cropEndY - cropStartY);
}

function endCrop() {
    if (!isCropping || !cropStartX) return;
    const width = Math.abs(cropEndX - cropStartX);
    const height = Math.abs(cropEndY - cropStartY);
    const startX = Math.min(cropStartX, cropEndX);
    const startY = Math.min(cropStartY, cropEndY);

    const imageData = ctx.getImageData(startX, startY, width, height);
    canvas.width = width;
    canvas.height = height;
    ctx.putImageData(imageData, 0, 0);

    image = new Image();
    image.src = canvas.toDataURL();
    isCropping = false;
    document.getElementById('cropBtn').textContent = 'Crop';
    cropStartX = cropStartY = cropEndX = cropEndY = null;
}

async function saveImage() {
    const dataUrl = canvas.toDataURL('image/png');
    const blobData = await fetch(dataUrl).then(res => res.blob());
    const arrayBuffer = await blobData.arrayBuffer();
    const name = `image_${Date.now()}.png`;

    try {
        const result = await backend.uploadImage(name, arrayBuffer);
        if ('ok' in result) {
            alert('Image saved successfully!');
        } else {
            throw new Error(result.err);
        }
    } catch (error) {
        console.error('Error saving image:', error);
        alert('Failed to save image. Please try again.');
    }
}
