import moment from 'moment'

export const formatDate = (_date: string | number = '', format?: string) => {

    const createdData = new Date(_date);
    const date = new Date();
    console.log(_date);


    const createdDate = new Date(createdData);
    const diffInSeconds = Math.floor((date.valueOf() - parseInt(_date.toString())) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);


    if (diffInHours < 24) {
        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (date.getDate() === createdData.getDate() && date.getMonth() === createdData.getMonth() && date.getFullYear() === createdData.getFullYear()) {
        return moment(_date).format(format || 'HH:mm');
    } else if ((date.getDate() - 1) === createdData.getDate() && date.getMonth() === createdData.getMonth() && date.getFullYear() === createdData.getFullYear()) {
        return 'Yesterday';
    } else if ((date.getDate() - 7) < createdData.getDate() && date.getMonth() === createdData.getMonth() && date.getFullYear() === createdData.getFullYear()) {
        return moment(_date).format(format || 'dddd');
    } else {
        return moment(_date).format(format || 'DD MMM, YYYY');
    }
}

export const cleanNumber = (text: string) => {
    if (!text) return '';

    const cleaned = text;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10, 13)}`;
};

export const formatNumber = (num: number) => {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'; // Billions
    }
    if (num >= 1e6) {
        return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'; // Millions
    }
    if (num >= 1e3) {
        return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'; // Thousands
    }
    return num.toString(); // Less than 1000
}

export const formatCurrency = (val: string, decimalPlaces: number = 2, currencySymbol: string = '$') => {
    const amount = parseFloat(val);
    if (isNaN(amount) || typeof amount !== 'number') return `${currencySymbol}0`;

    return `${currencySymbol}${amount
        .toFixed(decimalPlaces)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

