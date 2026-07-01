export const PROFILE_PHOTO_UPDATED_EVENT = 'driver-profile-photo-updated';

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg'];

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Не удалось прочитать файл'));

        reader.readAsDataURL(file);
    });
}

function getImageSize(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            resolve({
                width: image.width,
                height: image.height,
            });
        };

        image.onerror = () => {
            reject(new Error('Не удалось проверить размер изображения'));
        };

        image.src = dataUrl;
    });
}

export async function validateAndReadProfilePhoto(file) {
    if (!file) {
        return '';
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error('Можно загрузить только PNG или JPEG');
    }

    const dataUrl = await readFileAsDataUrl(file);
    const { width, height } = await getImageSize(dataUrl);

    if (width < 400 || height < 400) {
        throw new Error('Минимальный размер фото — 400x400 px');
    }

    if (width > 600 || height > 600) {
        throw new Error('Максимальный размер фото — 600x600 px');
    }

    return dataUrl;
}

export function notifyProfilePhotoUpdated(photoUrl) {
    window.dispatchEvent(
        new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, {
            detail: {
                photoUrl,
            },
        }),
    );
}

export function getAvatarFromUploadResponse(response, fallback = '') {
    return (
        response?.avatar ||
        response?.url ||
        response?.data?.avatar ||
        response?.data?.url ||
        fallback
    );
}
