document.addEventListener('DOMContentLoaded', () => {
    const targets = document.querySelectorAll('.scramble');
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    targets.forEach(target => {
        let interval = null;
        const originalText = target.innerText;

        const scramble = () => {
            let iteration = 0;

            clearInterval(interval);

            interval = setInterval(() => {
                target.innerText = originalText
                    .split("")
                    .map((letter, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }

                        return letters[Math.floor(Math.random() * 26)]
                    })
                    .join("");

                if (iteration >= originalText.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 3;
            }, 30);
        }

        // Run on load
        scramble();

        // Run on hover
        target.addEventListener('mouseover', scramble);
    });
});
