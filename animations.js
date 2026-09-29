document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') return;

    // --- Page Entrance Animation ---
    gsap.fromTo(
        document.body,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );

    // --- Page Exit Navigation Intercepting ---
    const handleNavigation = (e, href) => {
        if (!href) return;

        if (
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('#') ||
            (href.includes('://') && !href.startsWith(window.location.origin))
        ) {
            return;
        }

        e.preventDefault();

        gsap.to(document.body, {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
                window.location.href = href;
            }
        });
    };

    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor) {
            if (anchor.getAttribute('target') === '_blank') return;
            const href = anchor.getAttribute('href');
            if (href) {
                handleNavigation(e, href);
            }
        }
    });

    const navButtons = document.querySelectorAll('button[onclick*="location.href"]');
    navButtons.forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        const match = onclickAttr.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
        if (match && match[1]) {
            const targetUrl = match[1];
            button.removeAttribute('onclick');
            button.addEventListener('click', (e) => {
                handleNavigation(e, targetUrl);
            });
        }
    });

    // --- GSAP Accordion Dropdown Animations for <details> ---
    const allDetails = document.querySelectorAll('details');

    allDetails.forEach(details => {
        const summary = details.querySelector('summary');
        if (!summary) return;

        // Wrap non-summary children inside .details-wrapper if not already wrapped
        let wrapper = details.querySelector('.details-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'details-wrapper';
            const children = Array.from(details.childNodes).filter(child => child !== summary);
            children.forEach(child => wrapper.appendChild(child));
            details.appendChild(wrapper);
        }

        // Add custom indicator arrow if missing
        let arrow = summary.querySelector('.summary-arrow');
        if (!arrow) {
            arrow = document.createElement('span');
            arrow.className = 'summary-arrow';
            arrow.innerHTML = '▼';
            summary.appendChild(arrow);
        }

        // Set initial state based on 'open' attribute
        if (!details.hasAttribute('open')) {
            gsap.set(wrapper, { height: 0, opacity: 0, overflow: 'hidden' });
            gsap.set(arrow, { rotation: 0 });
        } else {
            gsap.set(wrapper, { height: 'auto', opacity: 1, overflow: 'visible' });
            gsap.set(arrow, { rotation: 180 });
        }

        // Add toggle handler on summary click
        summary.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = details.hasAttribute('open');

            if (isOpen) {
                // Collapse this details
                closeDetails(details, wrapper, arrow);
            } else {
                // Accordion behavior: close all other open details first
                allDetails.forEach(otherDetails => {
                    if (otherDetails !== details && otherDetails.hasAttribute('open')) {
                        const otherWrapper = otherDetails.querySelector('.details-wrapper');
                        const otherArrow = otherDetails.querySelector('.summary-arrow');
                        closeDetails(otherDetails, otherWrapper, otherArrow);
                    }
                });

                // Expand this details
                openDetails(details, wrapper, arrow);
            }
        });
    });

    function openDetails(details, wrapper, arrow) {
        details.setAttribute('open', '');
        gsap.killTweensOf([wrapper, arrow]);

        // Measure natural scrollHeight
        gsap.set(wrapper, { height: 'auto', opacity: 1 });
        const naturalHeight = wrapper.offsetHeight;
        gsap.set(wrapper, { height: 0, opacity: 0, overflow: 'hidden' });

        gsap.to(wrapper, {
            height: naturalHeight,
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                gsap.set(wrapper, { height: 'auto', overflow: 'visible' });
            }
        });

        if (arrow) {
            gsap.to(arrow, {
                rotation: 180,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }

    function closeDetails(details, wrapper, arrow) {
        gsap.killTweensOf([wrapper, arrow]);
        gsap.set(wrapper, { overflow: 'hidden' });

        gsap.to(wrapper, {
            height: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                details.removeAttribute('open');
            }
        });

        if (arrow) {
            gsap.to(arrow, {
                rotation: 0,
                duration: 0.3,
                ease: 'power2.in'
            });
        }
    }
});
