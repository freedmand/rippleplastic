import {poissonDisk} from './poisson.js';
import {remove} from './helpers';
import webAudioTouchUnlock from 'web-audio-touch-unlock';
import constants from './constants.js';
import IMAGES from './images.js';

const WORLD_MAP_SCENE = 'world_map';

const THEME_OUT = 0.1;
const THEME_IN = 0.06;

const TEXT_SCALE = 0.6;

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
  loadingCallback: () => void | null = null;
  scenes = ['hong_kong', 'snowflake', 'where_am_i', 'birds_nest', WORLD_MAP_SCENE];
  activeScene = 0;
  renderedEntities: HTMLElement[] = [];
  textEntities: HTMLElement[] = [];

  beginButton = document.getElementById('begin');
  beginPane = document.getElementById('beginpane');

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

  foregrounded = false;

  themeMusicAnimNumber = 1;

  animateThemeMusic(volume, duration = 2000) {
    this.themeSong.setAttribute(
      `animation__volume${this.themeMusicAnimNumber++}`,
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
    let toDestroy = this.renderedEntities.length;
    if (toDestroy > 0) {
      this.destroyRendered(() => this.worldmap());
      return;
    }

    this.worldMapVideo.setAttribute('visible', 'true');

    // (this.worldMapVideo as any).play();
    this.worldMapAsset.play();
    (this.worldMapAsset as HTMLElement).addEventListener('ended', () => {
      this.worldMapVideo.setAttribute('visible', 'false');
      this.outro();
    });
  }

  intro() {
    this.underwaterNoise.setAttribute(
      'animation__underwaterFade',
      `property: sound.volume; to: ${THEME_OUT}; dur: 2000`
    );
    setTimeout(() => {
      (this.introAudio as any).addEventListener(
        'sound-ended',
        () => {
          this.theme();
        },
        false
      );
      (this.introAudio as any).components.sound.playSound();
    }, 2000);
  }

  theme() {
    (this.themeSong as any).components.sound.playSound();
    this.animateThemeMusic(THEME_OUT);
    setTimeout(() => {
      this.hongkong();
    }, 12000);
  }

  hongkong() {
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);
    setTimeout(() => {
      (this.hongkongAudio as any).addEventListener(
        'sound-ended',
        () => {
          this.animateOutForeground();
          this.animateThemeMusic(THEME_OUT);
          setTimeout(() => {
            this.snowFlurry();
          }, 15000);
        },
        false
      );
      (this.hongkongAudio as any).components.sound.playSound();
      setTimeout(() => {
        this.animateInForeground('Mandy-Barker---p9378_CE__jrm.dae');
      }, 38000);
    }, 2000);
  }

  snowFlurry() {
    this.loadingCallback = () => {
      this.loadingCallback = null;

      // Fade out theme song.
      this.animateThemeMusic(THEME_IN);
      setTimeout(() => {
        (this.snowFlurryAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(() => {
              this.whereAmI();
            }, 15000);
          },
          false
        );
        (this.snowFlurryAudio as any).components.sound.playSound();
      }, 2000);
    };
    this.renderScene(1);
  }

  whereAmI() {
    this.loadingCallback = () => {
      this.loadingCallback = null;

      // Fade out theme song.
      this.animateThemeMusic(THEME_IN);
      setTimeout(() => {
        (this.whereAmIAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(() => {
              this.birdsNest();
            }, 15000);
          },
          false
        );
        (this.whereAmIAudio as any).components.sound.playSound();
      }, 2000);
    };
    this.renderScene(2);
  }

  birdsNest() {
    this.loadingCallback = () => {
      this.loadingCallback = null;

      // Fade out theme song.
      this.animateThemeMusic(THEME_IN);
      setTimeout(() => {
        (this.birdsNestAudio as any).addEventListener(
          'sound-ended',
          () => {
            this.animateThemeMusic(THEME_OUT);
            setTimeout(() => {
              this.worldmap();
            }, 15000);
          },
          false
        );
        (this.birdsNestAudio as any).components.sound.playSound();
      }, 2000);
    };
    this.renderScene(3);
  }

  outro() {
    // Fade out theme song.
    this.animateThemeMusic(THEME_IN);

    setTimeout(() => {
      (this.outroAudio as any).addEventListener(
        'sound-ended',
        () => {
          this.animateThemeMusic(THEME_OUT);

          setTimeout(() => {
            this.animateThemeMusic(0, 10000);
            this.credits();
          }, 5000);
        },
        false
      );
      (this.outroAudio as any).components.sound.playSound();
    }, 2000);
    this.renderScene(4);
  }

  async showTwoColumnText(
    left: string,
    right: string,
    leftPad: number,
    rightPad: number,
    anim: number = 2000
  ) {
    await this.removeText();

    const text1 = this.makeText(left, 'right', anim, leftPad);
    const text2 = this.makeText(right, 'left', anim, rightPad);

    this.foregroundContainer.appendChild(text1);
    this.foregroundContainer.appendChild(text2);
    this.renderedEntities.push(text1);
    this.renderedEntities.push(text2);
    this.textEntities.push(text1);
    this.textEntities.push(text2);

    await timeout(anim);
  }

  makeText(value: string, align: string, anim: number, pad: number = 0): HTMLElement {
    const text = document.createElement('a-text');

    text.setAttribute('value', value);

    text.setAttribute('font', 'aileronsemibold');
    text.setAttribute('white-space', 'pre');
    text.setAttribute('align', align);
    text.setAttribute('anchor', 'center');
    text.setAttribute('width', '40');
    text.setAttribute('height', 'auto');
    text.setAttribute('wrap-count', '80');
    text.setAttribute('line-height', '40');
    text.setAttribute('color', 'white');
    text.setAttribute('x-offset', `${pad}`);

    text.setAttribute(
      'animation__scale',
      `property: scale; dur: ${anim}; from: ${TEXT_SCALE - 0.5} ${TEXT_SCALE -
        0.5} ${TEXT_SCALE - 0.5}; to: ${TEXT_SCALE} ${TEXT_SCALE} ${TEXT_SCALE};`
    );
    text.setAttribute(
      'animation__opacity',
      `property: components.text.material.uniforms.opacity.value; dur: ${anim}; from: 0; to: 1;`
    );

    return text;
  }

  async showSimpleText(value: string, anim: number = 2000) {
    await this.removeText();

    const text = this.makeText(value, 'center', anim);

    this.foregroundContainer.appendChild(text);
    this.renderedEntities.push(text);
    this.textEntities.push(text);

    await timeout(anim);
  }

  removeText() {
    return new Promise(resolve => {
      if (this.textEntities.length == 0) {
        resolve();
        return;
      }

      this.textEntities.forEach(textEntity =>
        textEntity.addEventListener('animationcomplete', e => {
          if ((e as any).detail.name == 'animation__hide') {
            remove(textEntity);
            this.textEntities.splice(this.textEntities.indexOf(textEntity), 1);
            if (this.textEntities.length == 0) resolve();
            return;
          }
        })
      );

      this.textEntities.forEach(textEntity =>
        textEntity.setAttribute(
          'animation__hide',
          'property: components.text.material.uniforms.opacity.value; dur: 2000; from: 1; to: 0;'
        )
      );
    });
  }

  async credits() {
    // Show credits
    await timeout(5000);

    // Fade out sky
    Array.from(this.skyContainer.children).forEach(sky => {
      sky.setAttribute(
        'animation__credits',
        'property: components.material.material.opacity; from: 1; to: 0.25; dur: 2000'
      );
    });

    await this.showSimpleText(
      'A project of the Graduate Program in Journalism 2019\nDepartment of Communication\nStanford University'
    );

    await timeout(10000);

    await this.showTwoColumnText(
      'Photography\n\n\n\n\n\n',
      "Photographs copyright Mandy Barker\n\nHong Kong Soup: 1826 - Poon Choi\nEVERY... Snowflake is Dfferent\nWHERE...Am I Going\nSoup: Bird's Nest",
      -25,
      16.5
    );

    await timeout(13000);

    await this.showTwoColumnText(
      'Experience design\n\nProduction\n\nMusic\n\n',
      'Dylan Freedman\n\nDylan Freedman\n\n"Refuse"\nDylan Freedman',
      -21.5,
      19.9
    );

    await timeout(10000);

    await this.showTwoColumnText(
      'Sound design\n\nScript writing\n\n\nVoiceover\n\n',
      'Anthony J. Miller\n\nChristina Egerstrom, Amy Cruz,\nClaire Thompson\n\nAmy Cruz, Marta Oliver Craviotto,\nAnthony J. Miller',
      -24,
      17
    );

    await timeout(12000);

    await this.showTwoColumnText(
      'Storyboard\n\nTechnical support',
      'Anthony J. Miller\n\nJoseph Moreno, Jackie Botts',
      -22.2,
      18.8
    );

    await timeout(9000);

    await this.showTwoColumnText(
      'Additional audio\n\n\nAdvisor\n\n',
      'Tobin Asher\nStanford Virtual Human Interaction Lab\n\nProfessor Geri Migielicz\nHearst Professional in Residence',
      -24.5,
      16.5
    );

    await timeout(13000);

    await this.removeText();

    // Fade out sky entirely
    Array.from(this.skyContainer.children).forEach(sky => {
      sky.setAttribute(
        'animation__credits',
        'property: components.material.material.opacity; from: 0.25; to: 0; dur: 2000'
      );
    });
  }

  async startWebAudio() {
    const context = new (window['AudioContext'] || window['webkitAudioContext'])();
    await webAudioTouchUnlock(context);
  }

  constructor() {
    this.beginButton.addEventListener(
      'click',
      async () => {
        await this.startWebAudio();
        this.beginPane.classList.add('start');
        setTimeout(() => document.body.removeChild(this.beginPane), 5000);
        this.intro();
        // this.worldmap();

        // this.animateThemeMusic(0, 10000);
        // this.renderScene(4);
        // setTimeout(() => this.credits(), 2000);
        // this.credits();
      },
      false
    );

    // Render one scene at a time
    this.renderScene(this.activeScene);
    // Register event listeners.
    this.registerEvents();
  }

  /**
   * Create a foreground model.
   * @param model The string of the relative model URL to load.
   * @param rotation The rotation amount.
   */
  createForeground(
    model = 'IMG_6192_CT--AC.dae',
    rotation = '90 0 45',
    callback: () => void
  ) {
    Array.from(this.foregroundContainer.children).forEach(child => remove(child));
    this.foreground = document.createElement('a-entity');
    (this.foreground as any).addEventListener('model-loaded', () => {
      callback();
    });

    // this.foreground.setAttribute('collada-model', '#pandaasset');
    this.foreground.setAttribute('collada-model-legacy', `url(models/${model})`);
    this.foreground.setAttribute('rotation', rotation);
    this.foreground.setAttribute('scale', '0 0 0');

    this.foreground.setAttribute(
      'animation__rotation',
      'property: rotation; dur: 35000; loop: true; from: 338 -430 267; to: 178 -270 107; dir: alternate'
    );
    this.foreground.setAttribute(
      'animation__scale',
      'property: scale; dur: 1500; to: 0.8 0.8 0.8; easing: easeInQuad'
    );

    this.foregroundContainer.appendChild(this.foreground);
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
            if (toDestroy == 0) callback();
          }
        });
        animElem.setAttribute(
          'animation__destroy',
          'autoplay: true; property: components.material.material.opacity; to: 0; dur: 2000'
        );
      }
      return;
    }
    callback();
  }

  renderScene(idx) {
    let toDestroy = this.renderedEntities.length;
    if (toDestroy > 0) {
      this.destroyRendered(() => this.renderScene(idx));
      return;
    }

    const scene = this.scenes[idx];
    const spheres = scene == WORLD_MAP_SCENE ? [] : poissonDisk();

    let loadCounter = 0;
    this.handleLoadFn = () => {
      loadCounter++;
      if (loadCounter >= spheres.length + 1) {
        // this.loading.classList.add('loaded');
        if (this.loadingCallback != null) this.loadingCallback();
      }
    };

    const sky = document.createElement('a-sky');

    sky.addEventListener('materialtextureloaded', () => {
      this.handleLoadFn();
    });

    sky.setAttribute('src', `images/composites/${scene}.png`);
    sky.setAttribute('backround', 'black');
    sky.setAttribute('rotation', '0 0 0');
    sky.setAttribute('material', 'opacity: 0');
    sky.setAttribute(
      'animation__opacity',
      'startEvents: materialtextureloaded; property: components.material.material.opacity; to: 1; dur: 5000'
    );

    this.skyContainer.appendChild(sky);
    this.renderedEntities.push(sky);

    // Add spheres.
    let i = 0;
    for (const sphere of spheres) {
      const image = document.createElement('a-image');
      image.setAttribute('opacity', '0');
      image.setAttribute('material', 'alphaTest: 0.0001');
      image.setAttribute(
        'animation__opacity',
        'startEvents: materialtextureloaded; property: components.material.material.opacity; to: 1; dur: 2000'
      );

      image.addEventListener('materialtextureloaded', () => {
        this.handleLoadFn();
      });
      if (scene != WORLD_MAP_SCENE) {
        image.setAttribute(
          'src',
          `images/${scene}/${IMAGES[scene][i % IMAGES[scene].length]}`
        );
      } else {
        let randomScene = this.scenes[
          Math.floor(Math.random() * (this.scenes.length - 1))
        ];
        image.setAttribute(
          'src',
          `images/${randomScene}/${IMAGES[randomScene][i % IMAGES[randomScene].length]}`
        );
      }

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

  animateInForeground(
    path = 'Mandy-Barker---p9378_CE__jrm.dae',
    rotation = '190 0 45'
  ) {
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
