// Member Data
export const webringData = [
    // Example entry
    // { name: "Your Name", website: "https://your-site.com" },
];

export function initWebring() {
    handleNavigation();
}

function handleNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const nav = urlParams.get('nav');
    const hash = window.location.hash.slice(1);

    if (!nav || !hash || webringData.length === 0) return;

    const currentIndex = webringData.findIndex(
        member => member.website.includes(hash) || hash.includes(member.website.replace(/https?:\/\//, ''))
    );

    if (currentIndex === -1) return;

    let targetIndex;
    if (nav === 'prev') {
        targetIndex = currentIndex === 0 ? webringData.length - 1 : currentIndex - 1;
    } else if (nav === 'next') {
        targetIndex = currentIndex === webringData.length - 1 ? 0 : currentIndex + 1;
    } else {
        return;
    }

    window.location.href = webringData[targetIndex].website;
}
