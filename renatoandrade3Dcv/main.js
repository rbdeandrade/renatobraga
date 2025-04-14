import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 5); // Position at eye level

// Renderer setup
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Window light (main light)
const windowLight = new THREE.DirectionalLight(0xffffff, 1);
windowLight.position.set(5, 3, 5);
windowLight.castShadow = true;
windowLight.shadow.mapSize.width = 2048;
windowLight.shadow.mapSize.height = 2048;
windowLight.shadow.camera.far = 15;
windowLight.shadow.camera.left = -5;
windowLight.shadow.camera.right = 5;
windowLight.shadow.camera.top = 5;
windowLight.shadow.camera.bottom = -5;
scene.add(windowLight);

// Desk lamp light
const deskLight = new THREE.SpotLight(0xffa500, 1.5, 10, Math.PI / 4, 0.2, 1);
deskLight.position.set(-2, 2, -2);
deskLight.castShadow = true;
scene.add(deskLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI - 0.1; // Don't go below the floor
controls.target.set(0, 1.5, 0); // Look at the center of the room

// Loading manager setup
const loadingManager = new THREE.LoadingManager(
    // Loaded callback
    () => {
        const loadingScreen = document.getElementById('loading');
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    },
    // Progress callback
    (url, itemsLoaded, itemsTotal) => {
        const progressBar = document.querySelector('.progress');
        progressBar.style.width = `${(itemsLoaded / itemsTotal) * 100}%`;
    }
);

const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);

// Room creation functions
function createRoom() {
    const room = new THREE.Group();
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    
    try {
        const floorTexture = textureLoader.load(
            'https://threejs.org/examples/textures/hardwood2_diffuse.jpg',
            undefined,
            undefined,
            (err) => {
                console.error('Failed to load floor texture:', err);
                floorMaterial.color.set(0x8b4513); // Set a backup color
            }
        );
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(5, 5);
        
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            roughness: 0.8 
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        room.add(floor);
    } catch (error) {
        console.error("Error loading floor texture:", error);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.8 
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        room.add(floor);
    }
    
    const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xe0e0e0,
        roughness: 0.7 
    });
    
    try {
        const wallTexture = textureLoader.load(
            'https://threejs.org/examples/textures/brick_diffuse.jpg',
            undefined,
            undefined,
            (err) => {
                console.error('Failed to load wall texture:', err);
                wallMaterial.color.set(0xe0e0e0); // Set a backup color
            }
        );
        wallTexture.wrapS = THREE.RepeatWrapping;
        wallTexture.wrapT = THREE.RepeatWrapping;
        wallTexture.repeat.set(2, 2);
        wallMaterial.map = wallTexture;
    } catch (error) {
        console.error("Error loading wall texture:", error);
    }
    
    const backWallGeometry = new THREE.PlaneGeometry(10, 5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 2.5, -5);
    backWall.receiveShadow = true;
    room.add(backWall);
    
    const leftWallGeometry = new THREE.PlaneGeometry(10, 5);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-5, 2.5, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    room.add(leftWall);
    
    const rightWallGeometry = new THREE.PlaneGeometry(10, 5);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(5, 2.5, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    room.add(rightWall);
    
    const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
    const ceilingMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f5,
        roughness: 1.0 
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 5;
    room.add(ceiling);
    
    const windowFrameGeometry = new THREE.BoxGeometry(3, 3, 0.1);
    const windowFrameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513,
        roughness: 0.8 
    });
    const windowFrame = new THREE.Mesh(windowFrameGeometry, windowFrameMaterial);
    windowFrame.position.set(0, 2.5, -4.95);
    room.add(windowFrame);
    
    const windowGlassGeometry = new THREE.PlaneGeometry(2.8, 2.8);
    const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xadd8e6,
        transparent: true,
        opacity: 0.3,
        roughness: 0,
        transmission: 0.9,
    });
    const windowGlass = new THREE.Mesh(windowGlassGeometry, windowGlassMaterial);
    windowGlass.position.set(0, 2.5, -4.9);
    room.add(windowGlass);
    
    return room;
}

function createDesk() {
    const desk = new THREE.Group();
    const deskMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.8,
        metalness: 0.1
    });

    const deskTopGeometry = new THREE.BoxGeometry(3, 0.1, 1.5);
    const deskTop = new THREE.Mesh(deskTopGeometry, deskMaterial);
    deskTop.position.y = 0.75;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    desk.add(deskTop);

    const legGeometry = new THREE.BoxGeometry(0.15, 0.75, 0.15);
    const legPositions = [
        [-1.4, 0.375, 0.65], [1.4, 0.375, 0.65],
        [-1.4, 0.375, -0.65], [1.4, 0.375, -0.65]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, deskMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        desk.add(leg);
    });

    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, 0.8, -0.3);

    const standBaseGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.05, 32);
    const standMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.5 });
    const standBase = new THREE.Mesh(standBaseGeometry, standMaterial);
    standBase.position.y = 0.025;
    monitorGroup.add(standBase);

    const standNeckGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16);
    const standNeck = new THREE.Mesh(standNeckGeometry, standMaterial);
    standNeck.position.y = 0.175;
    monitorGroup.add(standNeck);

    const monitorFrameGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const monitorFrame = new THREE.Mesh(monitorFrameGeometry, standMaterial);
    monitorFrame.position.y = 0.55;
    monitorFrame.userData = { section: 'experience', interactive: true };
    monitorGroup.add(monitorFrame);

    const monitorScreenGeometry = new THREE.PlaneGeometry(1.15, 0.75);
    const monitorScreenMaterial = new THREE.MeshBasicMaterial({
        color: 0x0066ff,
        side: THREE.DoubleSide
    });
    const monitorScreen = new THREE.Mesh(monitorScreenGeometry, monitorScreenMaterial);
    monitorScreen.position.y = 0.55;
    monitorScreen.position.z = 0.03;
    monitorScreen.userData = { section: 'experience', interactive: true };
    monitorGroup.add(monitorScreen);

    desk.add(monitorGroup);

    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(-0.9, 0.8, 0);
    const laptopMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.6 });

    const laptopBaseGeometry = new THREE.BoxGeometry(0.7, 0.05, 0.5);
    const laptopBase = new THREE.Mesh(laptopBaseGeometry, laptopMaterial);
    laptopBase.castShadow = true;
    laptopBase.userData = { section: 'skills', interactive: true };
    laptopGroup.add(laptopBase);

    const keyboardGeometry = new THREE.PlaneGeometry(0.6, 0.4);
    const keyboardMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const keyboard = new THREE.Mesh(keyboardGeometry, keyboardMaterial);
    keyboard.position.y = 0.026;
    keyboard.rotation.x = -Math.PI / 2;
    laptopBase.add(keyboard);

    const laptopScreenGeometry = new THREE.BoxGeometry(0.7, 0.5, 0.02);
    const laptopScreen = new THREE.Mesh(laptopScreenGeometry, laptopMaterial);
    laptopScreen.position.y = 0.25;
    laptopScreen.position.z = -0.24;
    laptopScreen.rotation.x = -Math.PI / 2.5;
    laptopScreen.castShadow = true;
    laptopScreen.userData = { section: 'skills', interactive: true };
    laptopGroup.add(laptopScreen);

    const laptopDisplayGeometry = new THREE.PlaneGeometry(0.65, 0.45);
    const laptopDisplayMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff99,
        side: THREE.DoubleSide
    });
    const laptopDisplay = new THREE.Mesh(laptopDisplayGeometry, laptopDisplayMaterial);
    laptopDisplay.position.z = 0.011;
    laptopDisplay.userData = { section: 'skills', interactive: true };
    laptopScreen.add(laptopDisplay);

    desk.add(laptopGroup);

    return desk;
}

function createBookshelf() {
    const bookshelf = new THREE.Group();
    const shelfMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.7,
        metalness: 0.1
    });

    const sideGeometry = new THREE.BoxGeometry(0.15, 2, 0.5);
    const leftSide = new THREE.Mesh(sideGeometry, shelfMaterial);
    leftSide.position.set(-1.025, 1, -4.7);
    leftSide.castShadow = true;
    bookshelf.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeometry, shelfMaterial);
    rightSide.position.set(1.025, 1, -4.7);
    rightSide.castShadow = true;
    bookshelf.add(rightSide);

    const shelfGeometry = new THREE.BoxGeometry(2.2, 0.08, 0.5);
    const shelfPositions = [0.04, 1, 1.96];
    shelfPositions.forEach(yPos => {
        const shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
        shelf.position.set(0, yPos, -4.7);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        bookshelf.add(shelf);
    });

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xff00ff, 0xffff00, 0x00ffff];
    const bookBaseWidth = 0.18;
    const bookBaseHeight = 0.3;
    const bookBaseDepth = 0.4;
    let currentX = -0.9;

    for (let i = 0; i < 5; i++) {
        const bookHeight = bookBaseHeight * (0.9 + Math.random() * 0.2);
        const bookWidth = bookBaseWidth * (0.9 + Math.random() * 0.2);
        const bookGeometry = new THREE.BoxGeometry(bookWidth, bookHeight, bookBaseDepth);
        const bookMaterial = new THREE.MeshStandardMaterial({
            color: colors[i % colors.length],
            roughness: 0.7
        });
        const book = new THREE.Mesh(bookGeometry, bookMaterial);

        book.position.set(currentX + bookWidth / 2, 1 + bookHeight / 2, -4.7);
        book.castShadow = true;
        book.userData = { section: 'education', interactive: true };
        bookshelf.add(book);
        currentX += bookWidth + 0.05;
    }

    const diplomaGroup = new THREE.Group();
    diplomaGroup.position.set(0, 0.1, -4.6);
    diplomaGroup.userData = { section: 'education', interactive: true };

    const diplomaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 32);
    const diplomaMaterial = new THREE.MeshStandardMaterial({ color: 0xffffee, roughness: 0.5 });
    const diplomaRoll = new THREE.Mesh(diplomaGeometry, diplomaMaterial);
    diplomaRoll.rotation.z = Math.PI / 2;
    diplomaRoll.castShadow = true;
    diplomaGroup.add(diplomaRoll);

    const ribbonGeometry = new THREE.TorusGeometry(0.04, 0.005, 16, 100);
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.6 });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon.rotation.x = Math.PI / 2;
    ribbon.position.y = 0.001;
    diplomaGroup.add(ribbon);

    bookshelf.add(diplomaGroup);

    return bookshelf;
}

function createCouchArea() {
    const couchArea = new THREE.Group();

    const couchGroup = new THREE.Group();
    couchGroup.position.set(3, 0, -2);
    const couchMaterial = new THREE.MeshStandardMaterial({
        color: 0x4682B4,
        roughness: 0.7,
        metalness: 0.0
    });

    const baseGeometry = new THREE.BoxGeometry(2, 0.4, 0.9);
    const couchBase = new THREE.Mesh(baseGeometry, couchMaterial);
    couchBase.position.y = 0.2;
    couchBase.castShadow = true;
    couchBase.receiveShadow = true;
    couchGroup.add(couchBase);

    const backCushionGeometry = new THREE.BoxGeometry(0.9, 0.5, 0.2);
    const backCushionLeft = new THREE.Mesh(backCushionGeometry, couchMaterial);
    backCushionLeft.position.set(-0.5, 0.65, -0.35);
    backCushionLeft.rotation.x = -Math.PI / 18;
    backCushionLeft.castShadow = true;
    couchGroup.add(backCushionLeft);

    const backCushionRight = new THREE.Mesh(backCushionGeometry, couchMaterial);
    backCushionRight.position.set(0.5, 0.65, -0.35);
    backCushionRight.rotation.x = -Math.PI / 18;
    backCushionRight.castShadow = true;
    couchGroup.add(backCushionRight);

    const armGeometry = new THREE.BoxGeometry(0.2, 0.3, 0.9);
    const armLeft = new THREE.Mesh(armGeometry, couchMaterial);
    armLeft.position.set(-1.1, 0.35, 0);
    armLeft.castShadow = true;
    couchGroup.add(armLeft);

    const armRight = new THREE.Mesh(armGeometry, couchMaterial);
    armRight.position.set(1.1, 0.35, 0);
    armRight.castShadow = true;
    couchGroup.add(armRight);

    couchArea.add(couchGroup);

    const coffeeTableGroup = new THREE.Group();
    coffeeTableGroup.position.set(3, 0, -0.8);
    const tableMaterial = new THREE.MeshStandardMaterial({
        color: 0x966F33,
        roughness: 0.6,
        metalness: 0.2
    });

    const tableTopGeometry = new THREE.BoxGeometry(1.2, 0.08, 0.7);
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.y = 0.3;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    coffeeTableGroup.add(tableTop);

    const legGeometry = new THREE.BoxGeometry(0.08, 0.3, 0.08);
    const legPositions = [
        [-0.55, 0.15, 0.3], [0.55, 0.15, 0.3],
        [-0.55, 0.15, -0.3], [0.55, 0.15, -0.3]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, tableMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        coffeeTableGroup.add(leg);
    });

    couchArea.add(coffeeTableGroup);

    const photoFrameGroup = new THREE.Group();
    photoFrameGroup.position.set(3, 0.34, -0.8);
    photoFrameGroup.rotation.y = Math.PI / 6;
    photoFrameGroup.userData = { section: 'about', interactive: true };

    const frameGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.03);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5 });
    const photoFrame = new THREE.Mesh(frameGeometry, frameMaterial);
    photoFrame.castShadow = true;
    photoFrameGroup.add(photoFrame);

    const photoGeometry = new THREE.PlaneGeometry(0.36, 0.26);
    const photoMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const photo = new THREE.Mesh(photoGeometry, photoMaterial);
    photo.position.z = 0.016;
    photoFrameGroup.add(photo);

    couchArea.add(photoFrameGroup);

    return couchArea;
}

function createTrophyCase() {
    const trophyCase = new THREE.Group();
    trophyCase.position.set(-3, 0, -4.7);

    const caseMaterial = new THREE.MeshStandardMaterial({
        color: 0x5C4033,
        roughness: 0.6,
        metalness: 0.2
    });
    const baseGeometry = new THREE.BoxGeometry(1.5, 0.8, 0.5);
    const caseBase = new THREE.Mesh(baseGeometry, caseMaterial);
    caseBase.position.y = 0.4;
    caseBase.castShadow = true;
    caseBase.receiveShadow = true;
    trophyCase.add(caseBase);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.01,
        side: THREE.DoubleSide
    });
    const glassGeometry = new THREE.PlaneGeometry(1.4, 0.9);
    const glassFront = new THREE.Mesh(glassGeometry, glassMaterial);
    glassFront.position.y = 1.25;
    glassFront.position.z = 0.26;
    trophyCase.add(glassFront);

    const shelfGeometry = new THREE.BoxGeometry(1.4, 0.05, 0.4);
    const shelf = new THREE.Mesh(shelfGeometry, caseMaterial);
    shelf.position.y = 0.8;
    shelf.position.z = 0;
    shelf.receiveShadow = true;
    trophyCase.add(shelf);

    const trophyGroup = new THREE.Group();
    trophyGroup.position.y = 0.825;
    trophyGroup.userData = { section: 'awards', interactive: true };

    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        roughness: 0.2,
        metalness: 0.8
    });
    const cupBaseGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.08, 16);
    const cupBase = new THREE.Mesh(cupBaseGeometry, goldMaterial);
    cupBase.position.set(-0.4, 0.04, 0);
    cupBase.castShadow = true;
    trophyGroup.add(cupBase);

    const cupStemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16);
    const cupStem = new THREE.Mesh(cupStemGeometry, goldMaterial);
    cupStem.position.set(-0.4, 0.155, 0);
    cupStem.castShadow = true;
    trophyGroup.add(cupStem);

    const cupBowlGeometry = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cupBowl = new THREE.Mesh(cupBowlGeometry, goldMaterial);
    cupBowl.position.set(-0.4, 0.23, 0);
    cupBowl.rotation.x = Math.PI;
    cupBowl.castShadow = true;
    trophyGroup.add(cupBowl);

    const silverMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.2,
        metalness: 0.9
    });
    const medalGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32);
    const medal = new THREE.Mesh(medalGeometry, silverMaterial);
    medal.position.set(0, 0.1, 0.1);
    medal.rotation.x = Math.PI / 2;
    medal.rotation.z = -Math.PI / 12;
    medal.castShadow = true;
    trophyGroup.add(medal);

    const plaqueBaseGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.02);
    const plaqueBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x5C4033 });
    const plaqueBase = new THREE.Mesh(plaqueBaseGeometry, plaqueBaseMaterial);
    plaqueBase.position.set(0.4, 0.1, 0);
    plaqueBase.castShadow = true;
    trophyGroup.add(plaqueBase);

    const certificateGeometry = new THREE.PlaneGeometry(0.28, 0.18);
    const certificateMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 });
    const certificate = new THREE.Mesh(certificateGeometry, certificateMaterial);
    certificate.position.z = 0.011;
    plaqueBase.add(certificate);

    trophyCase.add(trophyGroup);

    return trophyCase;
}

function createNameSign() {
    const placeholderGeometry = new THREE.BoxGeometry(1, 0.2, 0.05);
    const placeholderMaterial = new THREE.MeshStandardMaterial({
        color: 0xdaa520,
        metalness: 0.8,
        roughness: 0.2
    });
    const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
    placeholder.position.set(0, 0.9, -4.85);
    placeholder.castShadow = true;
    scene.add(placeholder);
    
    const fontLoader = new FontLoader(loadingManager);
    fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
        function(font) {
            const textGeometry = new TextGeometry('RENATO', {
                font: font,
                size: 0.25,
                height: 0.05,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5
            });
            
            textGeometry.center();
            
            const textMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.5,
                roughness: 0.2
            });
            
            const text = new THREE.Mesh(textGeometry, textMaterial);
            text.position.set(0, 3.00, -4.90);
            text.castShadow = true;
            scene.add(text);
            
            scene.remove(placeholder);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% font loaded');
        },
        function(err) {
            console.error('Error loading font:', err);
        }
    );
}

function createDecorativeItems() {
    // Keep the picture frames and rug creation
    const pictureFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6 });
    const framePositions = [
        { pos: [-3, 2.5, -4.9], color: 0x6495ed },
        { pos: [3, 2.5, -4.9], color: 0xf08080 }
    ];

    framePositions.forEach(item => {
        const frameGroup = new THREE.Group();
        frameGroup.position.set(item.pos[0], item.pos[1], item.pos[2]);

        const frameGeometry = new THREE.BoxGeometry(0.7, 0.9, 0.05);
        const frame = new THREE.Mesh(frameGeometry, pictureFrameMaterial);
        frame.castShadow = true;
        frameGroup.add(frame);

        const pictureGeometry = new THREE.PlaneGeometry(0.6, 0.8);
        const pictureMaterial = new THREE.MeshBasicMaterial({ color: item.color });
        const picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
        picture.position.z = 0.026;
        frameGroup.add(picture);

        scene.add(frameGroup);
    });

    const rugGeometry = new THREE.PlaneGeometry(3, 2);
    const rugMaterial = new THREE.MeshStandardMaterial({
        color: 0x6A5ACD,
        roughness: 0.9
    });
    const rug = new THREE.Mesh(rugGeometry, rugMaterial);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(3, 0.01, -1.5);
    rug.receiveShadow = true;
    scene.add(rug);
}

// Project showcase area
function createProjectsArea() {
    const projectsArea = new THREE.Group();
    projectsArea.position.set(-3.5, 0, 2); // Position the table and plants

    // Create a display table for projects
    const tableTopGeometry = new THREE.BoxGeometry(2.5, 0.1, 3); // Resized to fit new orientation
    const tableMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.6,
        metalness: 0.2
    });
    const tableTop = new THREE.Mesh(tableTopGeometry, tableMaterial);
    tableTop.position.y = 0.75;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    projectsArea.add(tableTop);

    // Table legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.75, 0.1);
    const legPositions = [
        [-1.1, 0.375, 1.4], [1.1, 0.375, 1.4],
        [-1.1, 0.375, -1.4], [1.1, 0.375, -1.4]
    ];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, tableMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.castShadow = true;
        projectsArea.add(leg);
    });

    // Project plants - each plant represents a project
    const projects = [
        // Existing projects
        {
            id: 'groundbreaker',
            title: 'GroundBreaker',
            description: 'Open Innovation Gamified',
            position: [-1.5, 0, 0],
            color: 0xA0E160,
            thumbnail: 'img/groundbreakerthumb.png',
            fullDescription: 'Groundbreaker is a platform that manages the open innovation process using gamification to manage, prioritize and develop ideas in a simple and engaging way between the users!'
        },
        {
            id: 'ensinAR',
            title: 'ensin.AR',
            description: 'Education in Augmented Reality',
            position: [-0.9, 0, 0],
            color: 0x60A0E1,
            thumbnail: 'img/ensinarthumb.png',
            fullDescription: 'An educational project using Augmented Reality to create a more playful way of learning HTML for kids.'
        },
        {
            id: 'seguroauto',
            title: 'Seguro Auto',
            description: 'Driving Safe with The App',
            position: [-0.3, 0, 0],
            color: 0xE16060,
            thumbnail: 'img/seguroautothumb.png',
            fullDescription: 'Safety app for drivers to find safer routes based on accident data from insurance companies.'
        },
        {
            id: 'essilor',
            title: 'Essilor',
            description: 'Prescription Glasses AR Experience',
            position: [0.3, 0, 0],
            color: 0xE1A060,
            thumbnail: 'img/essilorthumb.png',
            fullDescription: 'Augmented Reality app and print for an easy presentation of a VR prescription app case for Essilor glasses.'
        },
        {
            id: 'melhorgrao',
            title: 'Melhor Grão',
            description: 'Coffeehouses and Roastery',
            position: [0.9, 0, 0],
            color: 0x8B4513,
            thumbnail: 'img/melhorgraothumb.png',
            fullDescription: 'Website development for Melhor Grão coffee houses and roastery, featuring their products and cafeterias.'
        },
        {
            id: 'edpchallenge',
            title: 'EDP Challenge',
            description: 'AR/VR within Service Design',
            position: [1.5, 0, 0],
            color: 0x800080,
            thumbnail: 'img/edp2019thumb.png',
            fullDescription: 'The present work is an initiative within the scope of EDP University Challenge 2019 of EDP - Energias de Portugal which aims to develop a project with the theme "The EDP commercial store of the future".'
        },
        // New projects from drawdesign.studio
        {
            id: 'obrasilnomundo',
            title: 'O Brasil no Mundo!',
            description: 'Interactive Map Application',
            position: [0, 0, 0.7],
            color: 0x6495ed,
            thumbnail: './img/obrasilnomundothumb.png',
            fullDescription: 'Saudades do Brasil, né minha filha?! An interactive map application that showcases Brazilian locations around the world.'
        },
        {
            id: 'dancesphere',
            title: 'DanceSphere',
            description: 'Dance App for Mobile',
            position: [0.6, 0, 0.7],
            color: 0x60A0E1,
            thumbnail: './img/dancespherethumb.png',
            fullDescription: 'All about dance, on your hands. A mobile application focused on the dance community and education.'
        },
        {
            id: 'encontracultura',
            title: 'Encontra Cultura',
            description: 'Cultural Events Platform',
            position: [1.2, 0, 0.7],
            color: 0xA0E160,
            thumbnail: './img/encontraculturathumb.png',
            fullDescription: 'The Culture on the right place. A platform for finding and promoting cultural events and venues.'
        },
        {
            id: 'drawpayments',
            title: 'Draw Payments',
            description: 'Financial Services Web Platform',
            position: [-0.6, 0, 0.7],
            color: 0xE16060,
            thumbnail: './img/drawpaymentsthumb.png',
            fullDescription: 'Easy Payments, the Draw way. A web platform for handling financial transactions and services.'
        },
        {
            id: 'miradouros',
            title: 'Miradouros',
            description: 'Scenic Viewpoints Mobile App',
            position: [-1.2, 0, 0.7],
            color: 0xE1A060,
            thumbnail: './img/miradourosthumb.png',
            fullDescription: 'Look and feel the world, at your hands. A mobile app for discovering scenic viewpoints and landscapes.'
        },
        {
            id: 'educar',
            title: 'EducAR App',
            description: 'Educational AR Application',
            position: [0, 0, 1.4],
            color: 0x8B4513,
            thumbnail: './img/educarthumb.png',
            fullDescription: 'A new reality for education. An augmented reality application designed for enhancing learning experiences.'
        },
        {
            id: 'pilgrim',
            title: 'Pilgrim',
            description: 'Sacred Paths Navigation App',
            position: [0.6, 0, 1.4],
            color: 0xA0E160,
            thumbnail: './img/pilgrimthumb.png',
            fullDescription: 'Navigate sacred paths with confidence. A mobile application for pilgrims and sacred sites travelers.'
        },
        {
            id: 'protesta',
            title: 'Protesta!',
            description: 'Activist Connection Platform',
            position: [-0.6, 0, 1.4],
            color: 0x60A0E1,
            thumbnail: './img/protestathumb.png',
            fullDescription: 'Organize and connect with like-minded activists. A web and mobile platform for coordinating social movements and protests.'
        }
    ];

    // Position projects in a grid pattern on the table
    const gridSize = Math.ceil(Math.sqrt(projects.length));
    const spacing = 0.7;
    const offsetX = ((gridSize - 1) * spacing) / 2;
    const offsetZ = ((gridSize - 1) * spacing) / 2;

    projects.forEach((project, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        const plantGroup = new THREE.Group();
        plantGroup.position.set(
            col * spacing - offsetX,
            0.8,
            row * spacing - offsetZ
        );

        plantGroup.userData = {
            section: 'projects',
            projectId: project.id,
            title: project.title,
            description: project.description,
            thumbnail: project.thumbnail,
            fullDescription: project.fullDescription,
            interactive: true
        };

        const potGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.15, 16);
        const potMaterial = new THREE.MeshStandardMaterial({
            color: 0xA0522D,
            roughness: 0.7
        });
        const pot = new THREE.Mesh(potGeometry, potMaterial);
        pot.position.y = 0.075;
        pot.castShadow = true;
        pot.receiveShadow = true;
        plantGroup.add(pot);

        const soilGeometry = new THREE.CylinderGeometry(0.09, 0.11, 0.03, 16);
        const soilMaterial = new THREE.MeshStandardMaterial({
            color: 0x5C4033,
            roughness: 0.9
        });
        const soil = new THREE.Mesh(soilGeometry, soilMaterial);
        soil.position.y = 0.135;
        plantGroup.add(soil);

        const leafMaterial = new THREE.MeshStandardMaterial({
            color: project.color,
            roughness: 0.6,
            side: THREE.DoubleSide
        });
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.6
        });

        const numStems = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numStems; i++) {
            const stemHeight = 0.15 + Math.random() * 0.1;
            const stemGeometry = new THREE.CylinderGeometry(0.005, 0.01, stemHeight, 8);
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);

            const angle = (Math.PI * 2 / numStems) * i + (Math.random() - 0.5) * 0.8;
            const radius = 0.02 + Math.random() * 0.03;
            stem.position.set(
                Math.cos(angle) * radius,
                0.15 + stemHeight / 2,
                Math.sin(angle) * radius
            );
            stem.rotation.z = (Math.random() - 0.5) * 0.6;
            stem.rotation.x = (Math.random() - 0.5) * 0.6;
            stem.castShadow = true;
            plantGroup.add(stem);

            const leafGeometry = new THREE.SphereGeometry(0.05, 6, 6);
            leafGeometry.scale(1, 0.2, 0.6);
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            leaf.position.y = stemHeight / 2 - 0.01;
            leaf.rotation.x = Math.PI / 3 + (Math.random() - 0.5) * 0.5;
            leaf.rotation.y = Math.random() * Math.PI;
            leaf.castShadow = true;
            stem.add(leaf);
        }

        projectsArea.add(plantGroup);
    });

    // Add info board directly to the scene, positioned on the left wall
    const infoBoardMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0 });
    const infoBoardGeometry = new THREE.PlaneGeometry(2, 1);
    const infoBoard = new THREE.Mesh(infoBoardGeometry, infoBoardMaterial);
    infoBoard.position.set(-4.95, 1.5, 2); // Position on left wall (x=-5), centered vertically and aligned with table Z
    infoBoard.rotation.y = Math.PI / 2; // Rotate to face into the room
    infoBoard.receiveShadow = true; // Allow receiving shadows
    scene.add(infoBoard); // Add directly to the scene

    // Title for the projects area, also added directly to the scene
    const fontLoader = new FontLoader(loadingManager);
    fontLoader.load(
        'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
        function(font) {
            const textGeometry = new TextGeometry('DESIGN', {
                font: font,
                size: 0.15,
                height: 0.02,
                curveSegments: 12,
                bevelEnabled: false
            });

            textGeometry.center(); // Center the text geometry itself

            const textMaterial = new THREE.MeshStandardMaterial({
                color: 0x333333
            });

            const text = new THREE.Mesh(textGeometry, textMaterial);
            // Position slightly in front of the wall, above the board
            text.position.set(-4.9, 2.1, 2); 
            text.rotation.y = Math.PI / 2; // Rotate to face into the room
            text.castShadow = true;
            scene.add(text); // Add directly to the scene
        }
    );

    // Return only the group containing the table and plants
    return projectsArea; 
}

// Explicitly create scene objects and verify
console.log("Creating 3D room scene...");

// Room
console.log("Creating room...");
const room = createRoom();
scene.add(room);

// Desk
console.log("Creating desk...");
const desk = createDesk();
desk.position.set(0, 0, 0);
scene.add(desk);

// Bookshelf
console.log("Creating bookshelf...");
const bookshelf = createBookshelf();
scene.add(bookshelf);

// Couch area
console.log("Creating couch area...");
const couchArea = createCouchArea();
scene.add(couchArea);

// Trophy case
console.log("Creating trophy case...");
const trophyCase = createTrophyCase();
scene.add(trophyCase);

// Name sign
console.log("Creating name sign...");
createNameSign();

// Decorative items
console.log("Adding decorative items...");
createDecorativeItems();

// Projects area
console.log("Creating projects area...");
const projectsArea = createProjectsArea();
scene.add(projectsArea);

// UI Interaction
let activeSection = 'about';
let interactiveObjects = [];
let currentLanguage = 'en';

// Collect all interactive objects
console.log("Collecting interactive objects...");
scene.traverse((object) => {
    if (object.userData && object.userData.interactive) {
        interactiveObjects.push(object);
    }
});

document.querySelectorAll('.navigation button').forEach(button => {
    button.addEventListener('click', () => {
        activeSection = button.dataset.section;
        updateActiveSection();
        
        // Move camera to focus on objects representing this section
        focusOnSection(activeSection);
    });
});

document.getElementById('reset-camera').addEventListener('click', () => {
    moveCameraTo(new THREE.Vector3(0, 1.6, 5), new THREE.Vector3(0, 1.5, 0));
});

document.getElementById('toggle-content').addEventListener('click', () => {
    const mainContent = document.querySelector('main');
    if (mainContent.style.display === 'none') {
        mainContent.style.display = 'block';
        document.getElementById('toggle-content').innerHTML = '<i class="fa fa-times"></i>';
    } else {
        mainContent.style.display = 'none';
        document.getElementById('toggle-content').innerHTML = '<i class="fa fa-bars"></i>';
    }
});

// Language toggle functionality
document.getElementById('toggle-language').addEventListener('click', () => {
    currentLanguage = currentLanguage === 'en' ? 'pt' : 'en';
    document.getElementById('lang-indicator').textContent = currentLanguage.toUpperCase();
    
    // Update all text content based on translations
    updateLanguageContent(currentLanguage);
});

function updateLanguageContent(lang) {
    if (!window.translations || !window.translations[lang]) {
        console.error('Translations not found for:', lang);
        return;
    }
    
    const t = window.translations[lang];
    
    document.title = t.pageTitle;
    
    document.querySelector('header h1').textContent = t.name;
    document.querySelector('header h2').textContent = t.tagline;
    
    document.querySelectorAll('.navigation button').forEach(button => {
        const section = button.getAttribute('data-section');
        if (t.navigation && t.navigation[section]) {
            button.textContent = t.navigation[section];
        }
    });
    
    for (const section in t.sections) {
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            const h3 = sectionElement.querySelector('h3');
            if (h3 && t.sections[section].title) {
                h3.textContent = t.sections[section].title;
            }
            
            if (section === 'about') {
                const paragraphs = sectionElement.querySelectorAll('.profile p');
                if (paragraphs.length >= 2 && t.sections.about.content) {
                    paragraphs[0].textContent = t.sections.about.content.para1;
                    paragraphs[1].textContent = t.sections.about.content.para2;
                }
                
                const contactLinks = sectionElement.querySelectorAll('.contacts a');
                contactLinks.forEach((link, index) => {
                    if (t.sections.about.contacts && t.sections.about.contacts[index]) {
                        const icon = link.querySelector('i');
                        const labelText = t.sections.about.contacts[index];
                        link.innerHTML = '';
                        link.appendChild(icon);
                        link.appendChild(document.createTextNode(' ' + labelText));
                    }
                });
            }
            
            if (section === 'experience' && t.sections.experience.jobs) {
                const jobItems = sectionElement.querySelectorAll('.item');
                t.sections.experience.jobs.forEach((job, index) => {
                    if (index < jobItems.length) {
                        const item = jobItems[index];
                        item.querySelector('h4').textContent = job.title;
                        item.querySelector('.sub').textContent = job.company;
                        item.querySelector('p:not(.sub)').textContent = job.description;
                        item.querySelector('.year').textContent = job.period;
                    }
                });
            }
            
            // Add education section handling
            if (section === 'education' && t.sections.education.items) {
                const eduItems = sectionElement.querySelectorAll('.item');
                t.sections.education.items.forEach((edu, index) => {
                    if (index < eduItems.length) {
                        const item = eduItems[index];
                        item.querySelector('h4').textContent = edu.degree;
                        item.querySelector('.sub').textContent = edu.institution;
                        item.querySelector('p:not(.sub)').textContent = edu.description;
                        item.querySelector('.year').textContent = edu.period;
                    }
                });
            }
            
            // Add awards section handling
            if (section === 'awards' && t.sections.awards.items) {
                const awardItems = sectionElement.querySelectorAll('.award');
                t.sections.awards.items.forEach((award, index) => {
                    if (index < awardItems.length) {
                        const item = awardItems[index];
                        item.querySelector('h4').textContent = award.title;
                        item.querySelector('.sub').textContent = award.organization;
                        item.querySelector('p:not(.sub)').textContent = award.description;
                    }
                });
            }
            
            // Enhanced projects section handling with structured translations
            if (section === 'projects') {
                const introParagraphs = sectionElement.querySelectorAll('p:not(.project-details p)');
                if (introParagraphs.length >= 2 && t.sections.projects.intro) {
                    introParagraphs[0].textContent = t.sections.projects.intro.para1;
                    introParagraphs[1].textContent = t.sections.projects.intro.para2;
                }
                
                // Re-display current project with updated translations if we're showing project details
                const projectDetails = sectionElement.querySelector('.project-details');
                if (projectDetails && activeSection === 'projects') {
                    const projectTitle = projectDetails.querySelector('h3').textContent;
                    
                    // Find which project object this is from the 3D scene
                    let matchingProject = null;
                    interactiveObjects.forEach(obj => {
                        if (obj.userData?.section === 'projects' && obj.userData?.projectId) {
                            // Match by ID instead of title since title may have changed with translations
                            const projId = obj.userData.projectId;
                            const oldTitle = t.sections.projects.projects[projId]?.title;
                            
                            if (oldTitle === projectTitle || obj.userData.title === projectTitle) {
                                matchingProject = obj.userData;
                            }
                        }
                    });
                    
                    if (matchingProject) {
                        showProjectDetails(matchingProject);
                    }
                }
            }
        }
    }
    
    const footerText = document.querySelector('footer p');
    if (footerText && t.footer) {
        footerText.textContent = t.footer;
    }
    
    console.log('Language changed to:', lang);
}

function updateActiveSection() {
    document.querySelectorAll('.navigation button').forEach(button => {
        if (button.dataset.section === activeSection) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    document.querySelectorAll('main section').forEach(section => {
        if (section.id === activeSection) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    interactiveObjects.forEach(obj => {
        if (obj.material) {
            if (obj.userData.section === activeSection) {
                if (!obj.material.emissive) {
                    obj.material.color.set(obj.material.color).multiplyScalar(1.5);
                } else {
                    obj.material.emissive.set(obj.material.color).multiplyScalar(0.5);
                    obj.material.emissiveIntensity = 0.5;
                }
            } else {
                if (!obj.material.emissive) {
                    obj.material.color.set(obj.material.color).multiplyScalar(0.67);
                } else {
                    obj.material.emissiveIntensity = 0;
                }
            }
        }
    });
}

function focusOnSection(section) {
    let targetPosition, targetLookAt;
    
    switch(section) {
        case 'about':
            targetPosition = new THREE.Vector3(1.5, 1.6, -1);
            targetLookAt = new THREE.Vector3(3, 0.5, -1.5);
            break;
        case 'education':
            targetPosition = new THREE.Vector3(-1, 1.6, -3);
            targetLookAt = new THREE.Vector3(0, 1.5, -4.7);
            break;
        case 'experience':
            targetPosition = new THREE.Vector3(-1, 1.6, 1);
            targetLookAt = new THREE.Vector3(0, 1.35, -0.3);
            break;
        case 'skills':
            targetPosition = new THREE.Vector3(-1.5, 1.6, 1);
            targetLookAt = new THREE.Vector3(-0.9, 0.9, -0.1);
            break;
        case 'awards':
            targetPosition = new THREE.Vector3(-2, 1.6, -3);
            targetLookAt = new THREE.Vector3(-3, 1, -4.7);
            break;
        case 'projects':
            targetPosition = new THREE.Vector3(-2.5, 1.6, 2);
            targetLookAt = new THREE.Vector3(-3.5, 1, 2);
            break;
        default:
            targetPosition = new THREE.Vector3(0, 1.6, 5);
            targetLookAt = new THREE.Vector3(0, 1.5, 0);
    }
    
    moveCameraTo(targetPosition, targetLookAt);
}

function moveCameraTo(targetPosition, targetLookAt = controls.target) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = Date.now();
    
    function updateCamera() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const t = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        camera.position.lerpVectors(startPosition, targetPosition, t);
        controls.target.lerpVectors(startTarget, targetLookAt, t);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(updateCamera);
        }
    }
    
    updateCamera();
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    
    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;
        
        while (selectedObject && !(selectedObject.userData && selectedObject.userData.interactive)) {
            selectedObject = selectedObject.parent;
        }

        if (selectedObject && selectedObject.userData && selectedObject.userData.section) {
            activeSection = selectedObject.userData.section;
            updateActiveSection();
            
            if (selectedObject.userData.projectId) {
                showProjectDetails(selectedObject.userData);
            }
        }
    }
});

function showProjectDetails(projectData) {
    const mainContent = document.querySelector('main');
    if (mainContent.style.display === 'none') {
        mainContent.style.display = 'block';
        document.getElementById('toggle-content').innerHTML = '<i class="fa fa-times"></i>';
    }

    let projectTitle = projectData.title;
    let projectDescription = projectData.fullDescription || projectData.description;
    
    // Get translated content from translations.js if available
    const t = window.translations?.[currentLanguage];
    if (t?.sections?.projects?.projects?.[projectData.projectId]) {
        const translatedProject = t.sections.projects.projects[projectData.projectId];
        projectTitle = translatedProject.title || projectTitle;
        projectDescription = translatedProject.description || projectDescription;
    }

    const projectContent = document.createElement('div');
    projectContent.className = 'project-details';
    
    const thumbnailHtml = projectData.thumbnail ? 
        `<img src="${projectData.thumbnail}" alt="${projectTitle}">` : '';
    
    const projectLink = `project${getProjectIndex(projectData.projectId)}.html`;

    // Get the view details button text from translations
    const viewDetailsText = t?.sections?.projects?.viewDetails || 'View Full Details';

    projectContent.innerHTML = `
        <h3>${projectTitle}</h3>
        ${thumbnailHtml}
        <p>${projectDescription}</p>
        <button onclick="window.open('${projectLink}', '_blank')" class="btn primary-btn">${viewDetailsText}</button>
    `;

    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
        const gridContainer = projectsSection.querySelector('.projects-grid');
        
        if (gridContainer) {
            gridContainer.innerHTML = '';
            gridContainer.appendChild(projectContent);
        }
    }
    
    activeSection = 'projects';
    updateActiveSection();
}

function getProjectIndex(projectId) {
    const projectMap = {
        'edpchallenge': 5,
        'groundbreaker': 0,
        'ensinAR': 1,
        'seguroauto': 2,
        'essilor': 3,
        'melhorgrao': 4
    };
    return projectMap[projectId] !== undefined ? projectMap[projectId] : '';
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function collectInteractiveObjects() {
    interactiveObjects = [];
    scene.traverse((object) => {
        if (object.userData && object.userData.interactive) {
            if (object.userData.section === 'projects' && object.userData.projectId) {
                const projectId = object.userData.projectId;
                
                if (window.translations && 
                    window.translations[currentLanguage] && 
                    window.translations[currentLanguage].sections.projects.projects && 
                    window.translations[currentLanguage].sections.projects.projects[projectId]) {
                    
                    const translatedProject = window.translations[currentLanguage].sections.projects.projects[projectId];
                    object.userData.translatedTitle = translatedProject.title;
                    object.userData.translatedDescription = translatedProject.description;
                }
            }
            
            interactiveObjects.push(object);
        }
    });
    console.log("Interactive objects re-collected:", interactiveObjects.length);
    updateActiveSection();
}

console.log("Initializing CV experience...");
collectInteractiveObjects();

animate();
console.log("3D Room CV started!");

window.addEventListener('error', function(e) {
    console.error("Runtime error detected:", e.message);
    document.getElementById('loading').innerHTML = `
        <h1>Error Loading 3D Experience</h1>
        <p>Sorry, there was a problem loading the 3D room. Please try refreshing the page or use a different browser.</p>
        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
    `;
});
