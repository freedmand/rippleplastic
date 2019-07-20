import {poissonDisk} from './poisson.js';
import {remove} from './helpers';
import webAudioTouchUnlock from 'web-audio-touch-unlock';
import constants from './constants.js';
import IMAGES from './images.js';
import {unlock} from './audio_context.js';

const WORLD_MAP_SCENE = 'world_map';

// const THEME_OUT = 0.05;
// const THEME_IN = 0.03;
const THEME_OUT = 0.05;
const THEME_IN = 0.03;

const CREDITS_SCALE = 1.65;

const NORMAL_SPEED = true;
const FAST = 1000;

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MainView {
  aframeScene = document.querySelector('a-scene');
  // loading = document.querySelector('.loader') as HTMLElement;
  skyContainer = document.getElementById('sky-container');
  transparencySphere: HTMLElement | null = null;
  foregroundContainer = document.getElementById('foreground-container');
  foreground: HTMLElement | null = null;

  handleLoadFn: Function | null = null;
  scenes = ['hong_kong', 'snowflake', 'where_am_i', 'birds_nest', WORLD_MAP_SCENE];
  activeScene = 0;
  renderedEntities: HTMLElement[] = [];
  // textEntities: HTMLElement[] = [];
  creditContainer: HTMLElement = document.getElementById('creditsimages');
  creditImg: HTMLElement | null = null;

  beginButton = document.getElementById('begin');
  beginPane = document.getElementById('beginpane');
  progressButton = document.getElementById('progressbutton');
  progressElem = document.getElementById('progress');

  underwaterNoise = document.getElementById('underwater');
  introAudio = document.getElementById('intro1');
  outroAudio = document.getElementById('outro');
  themeSong = document.getElementById('theme');
  hongkongAudio = document.getElementById('hongkong');
  snowFlurryAudio = document.getElementById('snowflurry');
  whereAmIAudio = document.getElementById('whereami');
  birdsNestAudio = document.getElementById('birdsnest');
  worldMapVideo = document.getElementById('worldmapvideo');
  worldMapAsset = document.getElementById('worldmapasset') as any;
  introImageContainer = document.getElementById('introimage');

  addIntroListener = false;
  addHongKongListener = false;
  snowFlurryListener = false;
  whereAmIListener = false;
  birdsNestListener = false;
  outroListener = false;
  worldMapListener = false;

  foregrounded = false;

  animateThemeMusic(volume, duration = 2000) {
    this.themeSong.setAttribute(
      `animation__volume`,
      `property: sound.volume; to: ${volume}; dur: ${duration}`
    );
  }

  fadeIn(imgId, delay = 0, duration = 200) {
    const imgEl = document.getElementById(imgId);
    imgEl.setAttribute(
      'animation__fadeIn',
      `property: opacity; to: 1; dur: ${duration}; delay: ${delay}`
    );
  }

  slideOver(imgId, delay = 0, duration = 1600) {
    const imgEl = document.getElementById(imgId);
    imgEl.setAttribute(
      'animation__slideOver',
      `property: position; to: -13 0 0; duration ${duration}; delay: ${delay}`
    );
  }

  worldmap() {
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(() => {
      let toDestroy = this.renderedEntities.length;
      if (toDestroy > 0) {
        this.destroyRendered(() => this.worldmap());
        return;
      }

      this.worldMapVideo.setAttribute('visible', 'true');

      // (this.worldMapVideo as any).play();
      if (!this.worldMapListener) {
        (this.worldMapAsset as HTMLElement).addEventListener('ended', () => {
          this.animateThemeMusic(THEME_OUT);
          this.worldMapVideo.setAttribute('visible', 'false');
          setTimeout(() => {
            this.outro();
          }, 2000);
        });
        this.worldMapListener = true;
      }
      this.worldMapAsset.play();
    }, 2000);
  }

  showIntroImage() {
    return new Promise(resolve => {
      const introImage = document.createElement('a-image');
      introImage.setAttribute('src', '#whatliesbeneath');
      introImage.setAttribute('width', '9');
      introImage.setAttribute('height', '6');
      introImage.setAttribute('position', '0 0 -12');
      introImage.setAttribute('opacity', '0');

      introImage.addEventListener('animationcomplete', e => {
        if ((e as any).detail.name == 'animation__introfadein') {
          setTimeout(
            () => {
              this.activeScene = 0;
              this.renderScene(this.activeScene, true, false, false);

              introImage.setAttribute(
                'animation__fadeOut',
                `property: components.material.material.opacity; from: 1; to: 0; dur: ${
                  NORMAL_SPEED ? 2000 : FAST
                }; delay: ${NORMAL_SPEED ? 4000 : FAST};`
              );
            },
            NORMAL_SPEED ? 2000 : FAST
          );
        }
        if ((e as any).detail.name == 'animation__fadeOut') {
          remove(introImage);
          resolve();
          return;
        }
      });

      introImage.setAttribute(
        'animation__introfadein',
        `property: components.material.material.opacity; to: 1; dur: ${
          NORMAL_SPEED ? 2000 : FAST
        }; delay: ${NORMAL_SPEED ? 3000 : FAST};`
      );

      this.introImageContainer.appendChild(introImage);
    });
  }

  async intro() {
    // Destroy remnants.
    this.activeScene = 0;
    this.renderScene(this.activeScene, false, false, true);

    await this.showIntroImage();

    this.activeScene = 0;
    this.renderScene(this.activeScene, false, true, false);

    this.underwaterNoise.setAttribute(
      'animation__underwaterFade',
      `property: sound.volume; to: ${THEME_OUT}; dur: 2000`
    );

    await timeout(NORMAL_SPEED ? 3000 : FAST);
    if (!this.addIntroListener) {
      (this.introAudio as any).addEventListener(
        'sound-ended',
        () => {
          this.theme();
        },
        false
      );
      this.addIntroListener = true;
    }
    (this.introAudio as any).components.sound.playSound();
  }

  theme() {
    (this.themeSong as any).components.sound.playSound();
    this.animateThemeMusic(THEME_OUT);
    setTimeout(
      () => {
        this.hongkong();
      },
      NORMAL_SPEED ? 12000 : FAST
    );
  }

  hongkong() {
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(
      () => {
        if (!this.addHongKongListener) {
          (this.hongkongAudio as any).addEventListener(
            'sound-ended',
            () => {
              this.animateOutForeground();
              this.animateThemeMusic(THEME_OUT);
              setTimeout(
                () => {
                  this.snowFlurry();
                },
                NORMAL_SPEED ? 15000 : FAST
              );
            },
            false
          );
          this.addHongKongListener = true;
        }
        (this.hongkongAudio as any).components.sound.playSound();
        setTimeout(
          () => {
            this.animateInForeground('#pandaasset');
          },
          NORMAL_SPEED ? 38000 : FAST
        );
      },
      NORMAL_SPEED ? 2000 : FAST
    );
  }

  async snowFlurry() {
    await this.renderScene(1);
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(() => {
      if (!this.snowFlurryListener) {
        (this.snowFlurryAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(
              () => {
                if (NORMAL_SPEED) {
                  this.whereAmI();
                } else {
                  this.intro();
                }
              },
              NORMAL_SPEED ? 15000 : FAST
            );
          },
          false
        );
        this.snowFlurryListener = true;
      }
      (this.snowFlurryAudio as any).components.sound.playSound();
    }, 500);
  }

  async whereAmI() {
    await this.renderScene(2);

    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(() => {
      if (!this.whereAmIListener) {
        (this.whereAmIAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(
              () => {
                this.birdsNest();
              },
              NORMAL_SPEED ? 15000 : FAST
            );
          },
          false
        );
        this.whereAmIListener = true;
      }
      (this.whereAmIAudio as any).components.sound.playSound();
    }, 500);
  }

  async birdsNest() {
    await this.renderScene(3);
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(() => {
      if (!this.birdsNestListener) {
        (this.birdsNestAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(
              () => {
                this.worldmap();
              },
              NORMAL_SPEED ? 15000 : FAST
            );
          },
          false
        );
        this.birdsNestListener = true;
      }
      (this.birdsNestAudio as any).components.sound.playSound();
    }, 500);
  }

  async outro() {
    await this.renderScene(4);
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);

    setTimeout(
      () => {
        if (!this.outroListener) {
          (this.outroAudio as any).addEventListener(
            'sound-ended',
            () => {
              this.animateThemeMusic(THEME_OUT);

              setTimeout(
                () => {
                  this.credits();
                },
                NORMAL_SPEED ? 5000 : FAST
              );
            },
            false
          );
          this.outroListener = true;
        }
        (this.outroAudio as any).components.sound.playSound();
      },
      NORMAL_SPEED ? 1200 : FAST
    );
  }

  removeCredits() {
    return new Promise(resolve => {
      if (this.creditImg == null) {
        resolve();
        return;
      }

      this.creditImg.addEventListener('animationcomplete', e => {
        if ((e as any).detail.name == 'animation__hide') {
          remove(this.creditImg);
          this.creditImg = null;
          resolve();
          return;
        }
      });

      this.creditImg.setAttribute(
        'animation__hide',
        'property: components.material.material.opacity; dur: 2000; from: 1; to: 0;'
      );
    });
  }

  showCredits(num: number) {
    return new Promise(resolve => {
      this.removeCredits().then(() => {
        const creditImg = document.createElement('a-image');
        creditImg.setAttribute('src', `#credits${num}`);
        creditImg.setAttribute('width', '9');
        creditImg.setAttribute('height', '3');
        creditImg.setAttribute('position', '0 0 -12');
        creditImg.setAttribute('opacity', '0');

        creditImg.addEventListener('animationcomplete', e => {
          if ((e as any).detail.name == 'animation__opacity') {
            resolve();
            return;
          }
        });

        creditImg.setAttribute(
          'animation__scale',
          `property: scale; dur: ${NORMAL_SPEED ? 2000 : FAST}; from: ${CREDITS_SCALE *
            0.95} ${CREDITS_SCALE * 0.95} ${CREDITS_SCALE *
            0.95}; to: ${CREDITS_SCALE} ${CREDITS_SCALE} ${CREDITS_SCALE};`
        );
        creditImg.setAttribute(
          'animation__opacity',
          `property: components.material.material.opacity; dur: ${
            NORMAL_SPEED ? 2000 : FAST
          }; from: 0; to: 1;`
        );

        this.creditImg = creditImg;
        this.creditContainer.appendChild(this.creditImg);
      });
    });
  }

  async credits() {
    // Show credits
    await timeout(NORMAL_SPEED ? 5000 : FAST);

    // Fade out sky
    Array.from(this.skyContainer.children).forEach(sky => {
      sky.setAttribute(
        'animation__credits',
        'property: components.material.material.opacity; from: 1; to: 0.25; dur: 2000'
      );
    });

    await this.showCredits(1);

    await timeout(NORMAL_SPEED ? 10000 : FAST);

    await this.showCredits(2);

    await timeout(NORMAL_SPEED ? 13000 : FAST);

    await this.showCredits(3);

    await timeout(NORMAL_SPEED ? 10000 : FAST);

    await this.showCredits(4);

    await timeout(NORMAL_SPEED ? 12000 : FAST);

    await this.showCredits(5);

    await timeout(NORMAL_SPEED ? 9000 : FAST);

    await this.showCredits(6);

    await timeout(NORMAL_SPEED ? 13000 : FAST);

    this.animateThemeMusic(0, NORMAL_SPEED ? 10000 : FAST);
    await this.removeCredits();

    // Fade out sky entirely
    this.destroyRendered(async () => {
      await timeout(NORMAL_SPEED ? 8000 : FAST);

      // Loop the experience
      this.intro();
    });
  }

  async startWebAudio() {
    const context = new (window['AudioContext'] || window['webkitAudioContext'])();
    await webAudioTouchUnlock(context);
  }

  loaded() {
    this.progressButton.style.opacity = '0';
    this.progressButton.style.pointerEvents = 'none';
    this.beginButton.style.visibility = 'visible';
  }

  hookAssetLoader() {
    const assetsContainer = document.querySelector('a-assets');

    assetsContainer.addEventListener('loaded', () => {
      this.loaded();
    });

    const assets = Array.from(assetsContainer.children);
    const assetState: {[key: string]: boolean} = {};
    let numLoaded = 0;

    const assetLoaded = (asset: HTMLElement) => {
      if (!assetState[asset.id]) {
        numLoaded++;
        this.progressElem.style.right = `${(1 -
          Math.min(numLoaded / assets.length, 1)) *
          100}%`;
      }
      assetState[asset.id] = true;

      if (numLoaded == assets.length) {
        this.loaded();
      }
    };

    assets.forEach((elem: HTMLElement) => {
      ['canplaythrough', 'load', 'loaded'].forEach(evt => {
        elem.addEventListener(evt, () => {
          assetLoaded(elem);
        });
      });
      if ((elem as HTMLImageElement).complete) assetLoaded(elem);
    });
  }

  touchStarted() {
    unlock();
    try {
      if (!(this.underwaterNoise as any).components.sound.isPlaying) {
        (this.underwaterNoise as any).components.sound.play();
      }
    } catch (e) {}
  }

  constructor() {
    this.hookAssetLoader();

    document.body.addEventListener('touchstart', () => this.touchStarted(), null);
    document.body.addEventListener('click', () => this.touchStarted(), null);

    this.beginButton.addEventListener(
      'click',
      async () => {
        this.beginPane.classList.add('start');
        setTimeout(() => document.body.removeChild(this.beginPane), 5000);

        this.intro();
      },
      false
    );

    // Register event listeners.
    // this.registerEvents();
  }

  /**
   * Create a foreground model.
   * @param model The string of the relative model URL to load.
   * @param rotation The rotation amount.
   */
  createForeground(model: string, rotation = '90 0 45', callback: () => void) {
    Array.from(this.foregroundContainer.children).forEach(child => remove(child));
    this.foreground = document.createElement('a-entity');
    (this.foreground as any).addEventListener('model-loaded', () => {
      callback();
    });

    this.foreground.setAttribute('collada-model-legacy', model);
    this.foreground.setAttribute('rotation', rotation);
    this.foreground.setAttribute('scale', '0 0 0');

    this.foreground.setAttribute(
      'animation__rotation',
      'property: rotation; dur: 35000; loop: true; from: 338 -430 267; to: 178 -270 107; dir: alternate'
    );
    this.foreground.setAttribute(
      'animation__scale',
      'property: scale; dur: 1500; to: 0.55 0.55 0.55; easing: easeInQuad'
    );

    this.foregroundContainer.appendChild(this.foreground);
  }

  async minimalBug() {
    let i = 0;
    while (true) {
      this.renderScene(i);
      i = (i + 1) % this.scenes.length;
      await timeout(6000);
    }
  }

  hideForeground() {
    if (this.foreground) {
      this.foreground.setAttribute(
        'animation__scaleHide',
        'property: scale; dur: 1000; to: 0 0 0; easing: easeOutQuad'
      );
    }
  }

  destroyRendered(callback: () => void) {
    let toDestroy = this.renderedEntities.length;
    if (toDestroy > 0) {
      while (this.renderedEntities.length > 0) {
        const elem = this.renderedEntities.pop();
        const animElem =
          elem.tagName.toLowerCase() == 'a-entity'
            ? (elem.firstChild as HTMLElement)
            : elem;
        animElem.addEventListener('animationcomplete', e => {
          if ((e as any).detail.name == 'animation__destroy') {
            remove(elem);
            toDestroy--;
            if (toDestroy == 0) {
              callback();
              return;
            }
          }
        });
        animElem.setAttribute(
          'animation__destroy',
          'autoplay: true; property: components.material.material.opacity; to: 0; dur: 2000'
        );
      }
      return;
    } else {
      callback();
    }
  }

  renderScene(idx, renderSky = true, renderSpheres = true, destroy = true) {
    return new Promise(resolve => {
      if (destroy) {
        let toDestroy = this.renderedEntities.length;
        if (toDestroy > 0) {
          if (renderSky == false && renderSpheres == false) {
            this.destroyRendered(() => {
              resolve();
              return;
            });
          } else {
            this.destroyRendered(() => {
              this.renderScene(idx).then(() => resolve());
            });
          }
          return;
        }
      }

      const scene = this.scenes[idx];
      const spheres = scene == WORLD_MAP_SCENE || !renderSpheres ? [] : poissonDisk();

      let loadCounter = 0;
      this.handleLoadFn = () => {
        loadCounter++;
        if (loadCounter >= spheres.length + 1) {
          resolve();
          return;
        }
      };

      if (renderSky) {
        const sky = document.createElement('a-sky');

        sky.addEventListener('animationcomplete', e => {
          if ((e as any).detail.name == 'animation__opacity') {
            this.handleLoadFn();
          }
        });

        sky.setAttribute('src', `#scene_${scene}`);
        sky.setAttribute('backround', 'black');
        sky.setAttribute('rotation', '0 0 0');
        sky.setAttribute('material', 'opacity: 0');
        sky.setAttribute(
          'animation__opacity',
          'startEvents: materialtextureloaded; property: components.material.material.opacity; to: 1; dur: 5000'
        );

        this.skyContainer.appendChild(sky);
        this.renderedEntities.push(sky);
      }

      // Add spheres.
      if (renderSpheres && spheres.length > 0) {
        const sceneStart: number = IMAGES[scene][0];
        const sceneEnd: number = IMAGES[scene][1];
        const sceneObjects: number = sceneEnd - sceneStart + 1;

        let i = 0;
        for (const sphere of spheres) {
          const image = document.createElement('a-image');
          image.addEventListener('animationcomplete', e => {
            if ((e as any).detail.name == 'animation__opacity') {
              this.handleLoadFn();
            }
          });

          image.setAttribute('opacity', '0');
          image.setAttribute('material', 'alphaTest: 0.0001');
          image.setAttribute(
            'animation__opacity',
            'startEvents: materialtextureloaded; property: components.material.material.opacity; to: 1; dur: 2000'
          );
          image.setAttribute('render-order', 'midground');
          image.setAttribute('src', `#object${(i % sceneObjects) + sceneStart}`);

          const container = document.createElement('a-entity');
          container.appendChild(image);

          const radius = sphere.radius * constants.radiusDrawMultiplier;
          container.setAttribute('position', `${sphere.x} ${sphere.y} ${sphere.z}`);
          image.setAttribute('rotation', `0 0 ${Math.random() * 360}`);
          image.setAttribute('scale', `${radius} ${radius} ${radius}`);
          container.setAttribute('look-at', '[camera]');
          this.aframeScene.appendChild(container);
          i++;

          if (!this.activeScene) {
            container.style.display = 'none';
          }

          this.renderedEntities.push(container);
        }
      }
    });
  }

  toggleStats() {
    if (this.aframeScene.hasAttribute('stats')) {
      this.aframeScene.removeAttribute('stats');
    } else {
      this.aframeScene.setAttribute('stats', '');
    }
  }

  animateOutForeground() {
    if (!this.foregrounded) return;
    this.foregrounded = false;

    // Animate foreground entities in.
    this.renderedEntities.forEach(entity => {
      const image = entity.firstChild as HTMLElement;
      if (image == null || image.tagName.toLowerCase() != 'a-image') return;

      image.setAttribute(
        'animation__inScale',
        `property: scale; dur: 1000; delay: 500; to: ${
          image.dataset.scale
        }; easing: easeOutQuad`
      );
      image.setAttribute(
        'animation__inOpacity',
        `property: components.material.material.opacity; dur: 1000; to: 1; delay: 500; easing: easeOutQuad`
      );
    });

    // Get rid of foreground object.
    this.hideForeground();
  }

  animateInForeground(path = '#pandaasset', rotation = '190 0 45') {
    if (this.foregrounded) return;
    this.foregrounded = true;

    this.createForeground(path, rotation, () => {
      // Animate foreground entities away.
      this.renderedEntities.forEach(entity => {
        const image = entity.firstChild as HTMLElement;
        if (image == null || image.tagName.toLowerCase() != 'a-image') return;

        // Remember the old scale.
        const scale = image.getAttribute('scale') as any;
        image.dataset.scale = `${scale.x} ${scale.y} ${scale.z}`;

        image.setAttribute(
          'animation__outScale',
          `property: scale; dur: 1000; to: 0 0 0; easing: easeOutQuad`
        );
        image.setAttribute(
          'animation__outOpacity',
          `property: components.material.material.opacity; dur: 500; to: 0; delay: 500; easing: easeOutQuad`
        );
      });
    });
  }

  registerEvents() {
    document.addEventListener(
      'keypress',
      e => {
        if (e.keyCode == 13) {
          // Enter
          // if (this.loading.classList.contains('loaded')) {
          this.activeScene = (this.activeScene + 1) % this.scenes.length;
          this.renderScene(this.activeScene);
          // }
        } else if (e.key == 's') {
          this.toggleStats();
        } else if (e.key == 'h') {
          this.animateOutForeground();
        } else if (e.key == 'a') {
          this.animateInForeground();
        } else if (e.key == 'z') {
          // remove(document.body);
        }
      },
      false
    );
  }
}

new MainView();
