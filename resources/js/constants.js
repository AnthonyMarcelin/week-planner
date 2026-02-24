// Constantes partagées pour l'application

export const HOUR_HEIGHT_DASHBOARD = 60;
export const HOUR_HEIGHT_PUBLIC = 40;

export const timeToNumber = timeStr => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
};
