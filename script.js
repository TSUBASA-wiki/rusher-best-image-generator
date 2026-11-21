const savedscores = JSON.parse(localStorage.getItem("datas")) || {};

async function loadJSON() {
    try{
        const response = await fetch("./songs.json")
        return await response.json()
    } catch(error){
        console.log(error)
    }  
}

async function init() {
    const songslist = await loadJSON()
    var template_songcard = document.getElementById("song_card")
    var template_difficulty = document.getElementById("difficulty")
    for (const [id, songdata] of Object.entries(songslist.songs)){
        const clone_songcard = template_songcard.content.cloneNode(true)
        clone_songcard.querySelector(".title").textContent = songdata.name
        clone_songcard.querySelector(".artist").textContent = songdata.artist
        clone_songcard.querySelector(".jacket").src = `./jackets/${songdata.id}.png`
        clone_songcard.querySelector(".jacket").alt = `${songdata.name} Jacket Art`
        for (const [difficulty, constant] of Object.entries(songdata.difficulty)){
            const clone_difficultycard = template_difficulty.content.cloneNode(true)
            clone_difficultycard.querySelector(".difficulty").dataset.songId = songdata.id
            clone_difficultycard.querySelector(".difficulty").dataset.songDiff = difficulty
            clone_difficultycard.querySelector(".difficulty_name").textContent = difficulty
            clone_difficultycard.querySelector(".difficulty_constant").textContent = constant
            if (savedscores[songdata.id]?.[difficulty]) {
                clone_difficultycard.querySelector(".accscore").value = savedscores[songdata.id][difficulty]["accscore"]
                clone_difficultycard.querySelector(".dscore").value = savedscores[songdata.id][difficulty]["dscore"]
                clone_difficultycard.querySelector(".fc").checked = savedscores[songdata.id][difficulty]["fc"]
            }
            clone_songcard.appendChild(clone_difficultycard)
        }
        document.getElementById("song-container").appendChild(clone_songcard)
    }
    document.getElementById("song-container").addEventListener("change", update_localstorage)
}

function update_localstorage(event) {
    const row = event.target.closest(".difficulty")
    const songid = row.dataset.songId
    const difficulty = row.dataset.songDiff
    const field = event.target.classList[0]
    if (savedscores[songid] == null) {
        savedscores[songid] = {}
    }
    if (savedscores[songid][difficulty] == null) {
        savedscores[songid][difficulty] = {}
    }
    if (event.target.type === "checkbox"){
        savedscores[songid][difficulty][field] = event.target.checked
    } else {
        savedscores[songid][difficulty][field] = event.target.value
    }
    localStorage.setItem("datas", JSON.stringify(savedscores))
}

init()
