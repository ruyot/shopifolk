import { animate, stagger, splitText, svg } from 'animejs';
import { CONFIG, state } from './config.js';

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.scrollTo(0, 0);

export function animateTextIn() {
    const words = Array.from(document.querySelectorAll('.word'));
    words.sort((a, b) => parseInt(a.dataset.order) - parseInt(b.dataset.order));

    setTimeout(() => {
        animate(words, {
            color: ['#E5E5E5', '#1A1A1A'],
            duration: CONFIG.textAnimDuration,
            ease: 'outExpo',
            delay: stagger(CONFIG.textStaggerDelay)
        });
    }, CONFIG.textAnimDelay);
}

export function setupScrollAnimation() {
    window.scrollTo(0, 0);

    let isVisible = false;
    let clickTriggered = false;
    const terminalBox = document.querySelector('.terminal-box');
    const terminalText = document.querySelector('.terminal-text');

    if (!terminalBox || !terminalText) return;

    const { chars } = splitText(terminalText, { chars: true });

    chars.forEach(char => {
        char.style.opacity = '0';
    });

    let hasExited = false;
    let hasExited2 = false;
    let hasExited3 = false;
    let hasNodesExited = false;

    window.addEventListener('scroll', () => {
        if (hasNodesExited) return;

        const scrollY = window.scrollY;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
        const showThreshold = 0.02;
        const startScroll = 0.03;
        const endScroll = 0.08;
        const clickThreshold = 0.10;
        const exitThreshold = 0.30;

        if (scrollProgress > showThreshold && !isVisible && !hasExited) {
            isVisible = true;
            terminalBox.classList.add('visible');
            animate(terminalBox, {
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 400,
                ease: 'outExpo'
            });
        }

        if (scrollProgress <= showThreshold && isVisible) {
            isVisible = false;
            clickTriggered = false;
            hasExited = false;
            hasExited2 = false;
            hasExited3 = false;
            hasNodesExited = false;

            state.nodes.forEach(node => {
                node.element.style.left = `${node.logoX}px`;
                node.element.style.top = `${node.logoY}px`;
                node.element.style.backgroundColor = node.color;
            });

            terminalBox.classList.remove('visible');
            terminalBox.style.opacity = '0';
            terminalBox.style.transform = '';
            terminalBox.style.boxShadow = 'none';
            chars.forEach(char => {
                char.style.opacity = '0';
            });

            const wordShit = document.querySelector('.word-shit');
            const wordDone = document.querySelector('.word-done');
            const wordWho = document.querySelector('.word-who');
            const wordGet = document.querySelector('.word-get');
            const wordThe = document.querySelector('.word-the');
            const wordPpl = document.querySelector('.word-ppl');
            if (wordShit) {
                wordShit.style.transform = '';
                wordShit.style.opacity = '';
            }
            if (wordDone) {
                wordDone.style.transform = '';
                wordDone.style.opacity = '';
            }
            if (wordWho) {
                wordWho.style.transform = '';
                wordWho.style.opacity = '';
            }
            if (wordGet) {
                wordGet.style.transform = '';
                wordGet.style.opacity = '';
            }
            if (wordThe) {
                wordThe.style.transform = '';
                wordThe.style.opacity = '';
            }
            if (wordPpl) {
                wordPpl.style.transform = '';
                wordPpl.style.opacity = '';
            }
        }

        if (!hasExited && scrollProgress >= startScroll && scrollProgress <= endScroll) {
            const progress = (scrollProgress - startScroll) / (endScroll - startScroll);
            const charsToShow = Math.floor(progress * chars.length);

            chars.forEach((char, index) => {
                char.style.opacity = index < charsToShow ? '1' : '0';
            });
        }

        if (!hasExited && scrollProgress > endScroll) {
            chars.forEach(char => {
                char.style.opacity = '1';
            });
        }

        if (!hasExited && scrollProgress >= clickThreshold && !clickTriggered) {
            clickTriggered = true;
            const corners = document.querySelectorAll('.corner');
            animate(terminalBox, {
                scale: [1, 1.02, 0.98, 1],
                duration: 300,
                ease: 'outElastic(1, 0.5)'
            });
            corners.forEach(corner => corner.classList.add('visible'));
            setTimeout(() => {
                corners.forEach(corner => corner.classList.remove('visible'));
            }, 500);
        }

        if (scrollProgress >= exitThreshold && !hasExited) {
            triggerExitAnimation();
        }

        const exitThreshold2 = 0.45;

        if (hasExited && scrollProgress >= exitThreshold2 && !hasExited2) {
            hasExited2 = true;
            const wordWho = document.querySelector('.word-who');
            const wordGet = document.querySelector('.word-get');

            animate([wordWho, wordGet], {
                translateY: ['0%', '150%'],
                opacity: [1, 0],
                duration: 400,
                ease: 'inExpo'
            });
        }

        if (hasExited2 && scrollProgress < exitThreshold2 - 0.05) {
            hasExited2 = false;
            const wordWho = document.querySelector('.word-who');
            const wordGet = document.querySelector('.word-get');

            animate([wordWho, wordGet], {
                translateY: ['150%', '0%'],
                opacity: [0, 1],
                duration: 400,
                ease: 'outExpo'
            });
        }

        const exitThreshold3 = 0.60;

        if (hasExited2 && scrollProgress >= exitThreshold3 && !hasExited3) {
            hasExited3 = true;
            state.mouseRepelDisabled = true;
            const wordThe = document.querySelector('.word-the');
            const wordPpl = document.querySelector('.word-ppl');

            animate([wordThe, wordPpl], {
                translateY: ['0%', '150%'],
                opacity: [1, 0],
                duration: 400,
                ease: 'inExpo'
            });
        }

        if (hasExited3 && scrollProgress < exitThreshold3 - 0.05) {
            hasExited3 = false;
            state.mouseRepelDisabled = false;
            const wordThe = document.querySelector('.word-the');
            const wordPpl = document.querySelector('.word-ppl');

            animate([wordThe, wordPpl], {
                translateY: ['150%', '0%'],
                opacity: [0, 1],
                duration: 400,
                ease: 'outExpo'
            });
        }

        if (hasExited && scrollProgress < exitThreshold - 0.05) {
            hasExited = false;

            const wordShit = document.querySelector('.word-shit');
            const wordDone = document.querySelector('.word-done');

            animate([wordShit, wordDone], {
                translateY: ['150%', '0%'],
                opacity: [0, 1],
                duration: 400,
                ease: 'outExpo'
            });

            terminalBox.classList.add('visible');
            animate(terminalBox, {
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                ease: 'outExpo'
            });
        }

        const nodesExitThreshold = 0.70;

        if (hasExited3 && scrollProgress >= nodesExitThreshold && !hasNodesExited) {
            hasNodesExited = true;

            document.body.style.overflow = 'hidden';
            window.scrollTo(0, scrollY);

            const sortedNodes = [...state.nodes].sort((a, b) => {
                if (b.logoY !== a.logoY) return b.logoY - a.logoY;
                return a.logoX - b.logoX;
            });

            const globeContainer = document.getElementById('globe-container');
            globeContainer.style.opacity = '1';

            const globeRect = globeContainer.getBoundingClientRect();

            sortedNodes.forEach((node, i) => {
                const pointIndex = Math.floor((i / sortedNodes.length) * state.globePoints.length);
                const targetPoint = state.globePoints[pointIndex] || state.globePoints[0];

                let targetX = globeRect.left + globeRect.width / 2;
                let targetY = globeRect.top + globeRect.height / 2;

                if (state.globeInstance && targetPoint) {
                    const coords = state.globeInstance.getScreenCoords(targetPoint.lat, targetPoint.lng, 0.001);
                    if (coords) {
                        targetX = coords.x + globeRect.left;
                        targetY = coords.y + globeRect.top;
                    }
                }

                const isLast = i === sortedNodes.length - 1;

                animate(node.element, {
                    left: [`${node.logoX}px`, `${targetX}px`],
                    top: [`${node.logoY}px`, `${targetY}px`],
                    backgroundColor: [node.color, CONFIG.lightGreen],
                    duration: 200,
                    delay: i * 1,
                    ease: 'outQuad',
                    onComplete: isLast ? () => {
                        setTimeout(() => {
                            const globeContainer = document.getElementById('globe-container');

                            state.nodes.forEach(n => {
                                animate(n.element, {
                                    opacity: [1, 0],
                                    duration: 200,
                                    ease: 'outQuad'
                                });
                            });

                            animate(globeContainer, {
                                opacity: [1, 0],
                                duration: 200,
                                ease: 'outQuad'
                            });

                            setTimeout(() => {
                                state.globeInstance.pointsData(state.globePoints);

                                animate(globeContainer, {
                                    opacity: [0, 1],
                                    duration: 300,
                                    ease: 'outQuad',
                                    onComplete: () => {
                                        state.globeInstance.controls().autoRotate = true;

                                        const titleSection = document.querySelector('.title-section');
                                        if (titleSection) {
                                            titleSection.style.opacity = '1';
                                        }

                                        const titleText = document.querySelector('.title-text');
                                        if (titleText) {
                                            const [drawable] = svg.createDrawable(titleText);
                                            drawable.draw = '0 0';

                                            animate(drawable, {
                                                draw: ['0 0', '0 1'],
                                                duration: 3000,
                                                ease: 'inOutQuad',
                                                onComplete: () => {
                                                    const fadeElements = document.querySelector('.title-fade-elements');
                                                    if (fadeElements) {
                                                        animate(fadeElements, {
                                                            opacity: [0, 1],
                                                            translateY: [10, 0],
                                                            duration: 500,
                                                            ease: 'outExpo'
                                                        });
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }, 500);
                        }, 100);
                    } : undefined
                });
            });
        }


    });

    function triggerExitAnimation() {
        hasExited = true;

        const wordShit = document.querySelector('.word-shit');
        const wordDone = document.querySelector('.word-done');

        animate([wordShit, wordDone], {
            translateY: ['0%', '150%'],
            opacity: [1, 0],
            duration: 400,
            ease: 'inExpo'
        });

        animate(terminalBox, {
            opacity: [1, 0],
            translateY: [0, 20],
            duration: 400,
            ease: 'inExpo',
            onComplete: () => {
                terminalBox.classList.remove('visible');
            }
        });
    }
}
