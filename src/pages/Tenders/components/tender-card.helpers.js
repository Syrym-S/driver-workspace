export function hasValue(value) {
    return value !== null && value !== undefined && value !== "";
}

export function getTimeLeft(endDateTime, status) {
    if (!endDateTime || !["new", "active"].includes(status)) {
        return "";
    }

    const endDate = new Date(String(endDateTime).replace(" ", "T"));
    const now = new Date();

    if (Number.isNaN(endDate.getTime())) {
        return "";
    }

    const diffMs = endDate.getTime() - now.getTime();

    if (diffMs <= 0) {
        return "Истёк";
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days > 0) {
        return `${days} д ${hours} ч`;
    }

    return `${hours} ч`;
}
