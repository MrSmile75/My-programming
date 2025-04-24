     /* © SMILEX - This code is licensed and protected. */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('background');
    const ctx = canvas.getContext('2d');
    const cursor = document.querySelector('.cursor');

        /* © SMILEX - This code is licensed and protected. */

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

        /* © SMILEX - This code is licensed and protected. */

  

    // Cursor and Interaction Management
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

        /* © SMILEX - This code is licensed and protected. */

    // Category Card Interactions
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                window.location.href = link;
            }, 200);
        });

            /* © SMILEX - This code is licensed and protected. */

        // 3D Tilt Effect
        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const x = (e.clientX - left) / width * 20 - 10;
            const y = (e.clientY - top) / height * 20 - 10;
            
            card.style.transform = `rotateX(${-y}deg) rotateY(${x}deg) scale(1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        });
    });
});

    /* © SMILEX - This code is licensed and protected. */
