// Helper functions, inspired by jQuery

/** @param {String} id @returns {HTMLElement} */ // @ts-ignore
function id(id) { return document.getElementById(id) }

/** @param {String} query @returns {HTMLElement} */ // @ts-ignore
function $(query) { return document.querySelector(query) }

/** @param {String} query @returns {NodeListOf<HTMLElement>} */ // @ts-ignore
function $all(query) { return document.querySelectorAll(query) }


// =============================================================
// JSDoc definitions

/** @typedef {"loadingScene"|"mainMenuScene"|"transformScene"|"previousScene"|"creditScene"} Scene */
/** @typedef {{ name: string; author?: string; filepath: string }} foundCharacter */
/** @typedef {{ name: string; data: File|String }} imageResource */
/** @typedef {File|String} soundResource */
/** @typedef {{
    name: string;
    author?: string;
    folder: string;
    localDB: boolean;
    transformations: string[];
    sounds?: Object<string, {
        from: soundResource;
        to: soundResource;
        tap: soundResource
    }>;
    images: {
        button: imageResource[];
        character: imageResource[];
    };
}} Character */


// ===========================================
// Code that runs once when the page is loaded

/** @type {Map<string, File>} */
let loadedFiles = new Map()

/** @type {Character[]} */
let characters = []

/** @type {Character} */
let currentCharacter

/** @type {string[]} */
let state = []

/** @type {Scene} */ // @ts-expect-error
let currentScene = $(".scene.active")?.id ?? ""
let previousScene = currentScene

/** @type {HTMLImageElement} */ // @ts-expect-error
const transformee = id("transformee")

const placeholder = `Assets/Sprites/Image_Missing_1280.png`
const imageFilter = /\.(a?png|jpe?g|pjp(?:eg)?|webp|avif|gif|jfif|tiff?|bmp|svg|cur)$/i

const demoCharacters = [{
    "name": "Draden",
    "author": "DonHp",
    "localDB": false,
    "transformations": ["Inflatable", "Standee"],
    "folder": "Databases/Draden_Demo",
    "images": {
        "button": [
            {
                "name": "Inflatable",
                "data": "Databases/Draden_Demo/Transformation_Icons/Inflatable.PNG"
            }, {
                "name": "Standee",
                "data": "Databases/Draden_Demo/Transformation_Icons/Standee.PNG"
            }
        ],
        "character": [
            {
                "name": "Draden",
                "data": "Databases/Draden_Demo/Character_Images/Draden.PNG"
            }, {
                "name": "Draden%Standee%Inflatable",
                "data": "Databases/Draden_Demo/Character_Images/Standee/Draden%25Standee%25Inflatable.PNG"
            }, {
                "name": "Draden%Standee",
                "data": "Databases/Draden_Demo/Character_Images/Standee/Draden%25Standee.PNG"
            }, {
                "name": "Draden%Inflatable%Standee",
                "data": "Databases/Draden_Demo/Character_Images/Inflatable/Draden%25Inflatable%25Standee.PNG"
            }, {
                "name": "Draden%Inflatable",
                "data": "Databases/Draden_Demo/Character_Images/Inflatable/Draden%25Inflatable.PNG"
            }
        ]
    }
}]

setup()
switchScene("mainMenuScene")


// ===========================================
// Functions

function setup() {
    // @ts-expect-error : Write version to the footer
    if ("version" in window) id("versionText").innerText = version

}

/** @param {Scene} sceneID */
function switchScene(sceneID) {

    // Support going back
    const ID = (sceneID == "previousScene") ? previousScene : sceneID
    if (ID == currentScene) return

    // Load elements 
    const previousActiveScene = $(".scene.active")
    const newActiveScene = $(".scene#" + ID)

    if (newActiveScene == null)
        throw new ReferenceError(`Scene ${ID} not found`)

    // Change variables and DOM
    previousScene = currentScene
    currentScene = ID
    previousActiveScene?.classList.remove("active")
    newActiveScene.classList.add("active")

    setupScene(ID)
    id("exit").innerText = (currentScene == "mainMenuScene") ? "Exit" : "Menu"

    console.debug("Loaded scene", ID, /* newActiveScene */)
    return { previousActiveScene, newActiveScene }
}

function setupScene(sceneID) {
    switch (sceneID) {
        case "mainMenuScene":
            makeCharacterSelection()
            break;
        case "databaseScene":
            if (!DataTransferItem.prototype.webkitGetAsEntry)
            id("databaseStats").innerHTML = "It looks like your current browser doesn't support folder upload yet."
            break;
        case "transformScene":
            makeTransformScene()
            break;
        default: break;
    }
}

/** @param {Event} event */
async function readDatabase(event) {

    console.group("Upload")

    /** @type {FileList} */ // @ts-expect-error
    const uploaded = event.target?.files
    console.debug("Uploaded folder:", uploaded)

    // @ts-expect-error
    id("unloadButton").disabled = false
    id("databaseStats").innerHTML = uploaded.length + " files loaded<br>"

    // Read files
    let foundCharacters = await readFiles()

    // Count found characters
    if (foundCharacters.length == 0) {
        console.groupEnd()
        console.warn("No characters found")
        id("databaseStats").innerHTML += "No characters found<br>"
        return
    }

    // Scan character transformations
    const foundTransformations = await scanTransformations(foundCharacters)

    // Scan images
    const foundImages = findImages()

    // Build character
    buildCharacters()

    console.groupEnd()
    console.debug("List of characters:", characters)

    return characters


    async function readFiles() {
        let foundCharacters = []
        for (let i = 0; i < uploaded.length; i++) {

            const file = uploaded[i]
            const [name, path] = [file.name, file.webkitRelativePath]
            const [normName, normPath] = [name.toLowerCase(), path.toLowerCase()]

            if (!loadedFiles.has(path) || loadedFiles[path]?.lastModified > file?.lastModified) {
                console.debug("+", path)
                loadedFiles.set(path, file)
            } else { console.info("Skip loading", path, "- file already loaded")} 

            if (normName == "names.txt") {
                const names = await loadFileLines(file)
                if (names.length == 0 || names[0] == "") throw new Error("Character name not found in " + path)
                /** @type {foundCharacter} */
                const char = { name: names[0], author: names?.[1], filepath: path }
                id("databaseStats").innerHTML += `Found character <b>${char.name}</b> ${char.author ? `by <b>${char.author}</b>` : ""} <br>`
                foundCharacters.push(char)
            }
        }
        return foundCharacters
    }

    /** @param {foundCharacter} foundChar */
    function removeChar(foundChar, reason="") {
        foundCharacters = foundCharacters.filter(ch => ch.filepath != foundChar.filepath)
        id("databaseStats").innerHTML += reason + "<br>"
        console.warn(reason)
    }

    /** @param {foundCharacter[]} foundCharacters */
    async function scanTransformations(foundCharacters) {
        return await Promise.all(foundCharacters.map(async (/** @type {{ filepath: string; name: any; }} */ foundChar) => {

            const parent = getParentFolder(foundChar.filepath)
            const TFfile = parent + "/Transformations.txt"

            if (!loadedFiles.has(TFfile)) {
                removeChar(foundChar, `Transformation file for ${foundChar.name} not found`)
                return
            }

            const forms = ( await loadFileLines(TFfile) ).slice(1)

            return { filepath: foundChar.filepath, forms }
        }))
    }

    function findImages() {
        return foundTransformations.map(foundTF => {
            /** @type {foundCharacter} */ // @ts-expect-error
            const char = foundCharacters.find(ch => ch.filepath == foundTF?.filepath)
            const parent = getParentFolder(char.filepath)

            const charFiles = Array.from(loadedFiles.entries()).filter(
                ([path, file]) => path.startsWith(parent + "/")
                    && !path.match(/(Names|Transformations)\.txt$/i)
                    && path.match(imageFilter)
            )

            /** @type {[string, File][][]} */
            const [imgChar, imgTF] = partition(charFiles, ([path, file]) => path.includes("/Character_Images/"))

            /** @type {imageResource[]} */
            const filesChar = imgChar.map(([path, file]) => { return { name: getFilename(path).name, data: file } })
            /** @type {imageResource[]} */
            const filesTF = imgTF.map(([path, file]) => { return { name: getFilename(path).name, data: file } })

            return { char, foundTF, parent, filesChar, filesTF }
        })
    }

    function buildCharacters() {
        foundImages.forEach(thing => {
            // Remove if already added
            (characters = characters.filter(ch => ch.name != thing.char.name))

            /** @type {Character} */
            const character = {
                name: thing.char.name,
                author: thing.char.author ?? undefined,
                localDB: true, // @ts-ignore
                transformations: thing.foundTF.forms,
                folder: thing.parent,
                images: {
                    button: thing.filesTF,
                    character: thing.filesChar
                }
            }
            characters.push(character)
            id("databaseStats").innerHTML += `<small>(<b>${character.name}</b>: ${character.transformations.length}`
                + ` transformations, ${character.images.character.length} character images)</small><br>`
        })
        return characters
    }
}

function unloadDatabase() {
    if (characters.length > 0 && confirm(`Unload ${characters.length} character${characters.length == 1 ? "" : "s"}?`)) {
        loadedFiles.forEach((file, key) => loadedFiles.delete(key))
        characters = characters.filter(char => !char.localDB)
        // @ts-expect-error
        id("unloadButton").disabled = true
        id("databaseStats").innerHTML = "Database unloaded"
        id("databaseUpload").outerHTML = `<wbr id="databaseUpload">`
        id("databaseUpload").outerHTML = `<input type="file" id="databaseUpload" webkitdirectory="" directory="" onchange="readDatabase(event)">`
    }
}

async function makeCharacterSelection() {
    const fullCharacterList = [...demoCharacters, ...characters]
    id("characters").innerHTML = "";
    (fullCharacterList.forEach(async (character, i) => {
        let el = document.createElement("div")
        el.dataset["charIndex"] = String(i)
        el.classList.add("character", "popup")
        el.style.order = String(i)
        el.onclick = () => {
            currentCharacter = character;
            switchScene("transformScene")
        }
        
        // Add image
        let img = document.createElement("img")
        img.draggable = false
        img.src = await readImage(character.images.character.find(x => x.name == character.name)?.data)
        el.appendChild(img)

        // Add title
        el.innerHTML += `<div><hgroup><b>${character.name}</b><span class="minor">${character.author ?? ""}</span></hgroup>`

        // Add metadata
        + `<small>${character.images.character.length} images<br>`
        + `<span title="${character.transformations.join("\n")}">${character.transformations.length} transformations</span><br><span class="minor">`
        + (character.localDB ? `<span title="${character.folder}">Loaded locally ⓘ</span>` : "Pre-loaded as demo") + `</span></small></div>`

        id("characters").appendChild(el)
    }))
}

async function makeTransformScene() {
    const char = currentCharacter

    // Clean up from before
    if (previousScene != "creditScene") state = []
    id("tfButtons").innerHTML = ""

    // Generate buttons
    char.transformations.forEach(async (tf, i) => {
        let img = document.createElement("img")

        img.classList.add("tfButton")
        img.dataset.state = tf
        img.draggable = false
        img.title = tf
        img.onclick = () => { state.push(tf); refreshState() }
        img.src = await readImage(char.images.button.find(x => x.name == tf)?.data)

        let cont = document.createElement("i")
        cont.style.order = String(i)
        cont.appendChild(img)
        id("tfButtons").appendChild(cont)
    })

    // Update images and buttons states
    await refreshState()
}

async function refreshState() {
    const char = currentCharacter
    console.debug("State:", state)

    // Update character image
    const searchValue = [char.name, ...state].join("%")
    transformee.src = await readImage(char.images.character.find(x => x.name == searchValue)?.data)

    // Update undo button
    const undo = id("undo")
    state.length < 1 ? undo.classList.add("disabled") : undo.classList.remove("disabled")
    undo.onclick = () => { state = state.slice(0, -1); refreshState() }

    // Update TF buttons
    $all("#tfButtons .tfButton").forEach(async button => {
        button.parentElement?.classList.remove("disabled", "warningBadge")

        const potentialState = [char.name, ...state, button.dataset.state].join("%")
        const potentialImage = char.images.character.find(x => x.name == potentialState)?.data

        if (potentialImage == undefined)
            button.parentElement?.classList.add("disabled")
        
        else if (typeof potentialImage == "string" && await testURL(potentialImage) == false)
            button.parentElement?.classList.add("warningBadge")
    })
    
    // Prepare for interactions
    id("transformee").dataset.topState = state.slice(-1)[0] ?? "Normal"
}

/** @param {string} text @link https://github.com/ryanve/eol/blob/7045668d0b0aba1e9f1433638548235baf0c04cb/eol.js */
function normalizeNewLine(text) {
    return text.replace(/\r\n|\r|\n/g, "\n")
}

/** @param {string} path */
function getParentFolder(path, sep="/") {
    return path.split(sep).slice(0, -1).join(sep)
}

/** @param {string} path */
function getFilename(path, sep="/") {
    // @ts-expect-error
    const [name, ext] = path.split(sep).pop().split(".")
    return {name, ext}
}

/** @param {File|string} file */
async function loadFileLines(file) {
    const f = (file instanceof File) ? file : loadedFiles.get(file)
    const text = await f?.text()
    return (!text) ? [] : normalizeNewLine(text)
        .split("\n")
        .map(line => line.trim())
}

function readImage(file) {
    return new Promise(async (resolve, reject) => {
        // Return URL if source is a valid URL
        if (typeof file === "string") {
            const isValid = await testURL(file)
            resolve(isValid ? file : placeholder)
            return
        }

        // Error if file isn't an image
        if (file.type && !file.type.startsWith("image/"))
        reject(`File is not an image. ${file.type} ${file}`)
        
        // Otherwise load the file
        const reader = new FileReader()
        reader.addEventListener("load", async event => resolve(event.target?.result))
        reader.addEventListener("error", async error => reject(error))
        reader.readAsDataURL(file)
    })
}


/**
 * @param {Array} array @param {Function} filter
 * @link https://stackoverflow.com/a/50636286 */
function partition(array, filter) {
    let pass = [], fail = []
    array.forEach((e, idx, arr) => ( filter(e, idx, arr) ? pass : fail ).push(e))
    return [pass, fail]
}

/** @param {Event} error */
function missingImage(error) {
    const img = error.target
    if (img instanceof HTMLImageElement)
    img.src = `Assets/Sprites/Image_Missing_1280.png`
}

/** @link https://stackoverflow.com/a/69689348 @param {URL | string} url */
async function testURL(url) {
    const response = await fetch(url)
    return [200, 304].includes(response.status)
}

/** @link https://stackoverflow.com/a/12896858 */
function exit() {
    if (currentScene != "mainMenuScene") switchScene("mainMenuScene")
    else open(location.href, "_self")?.close()
}