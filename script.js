const savedscores = JSON.parse(localStorage.getItem("datas")) || {};

async function loadJSON() {
    try{
        const response = await fetch("./songs.json")
        return await response.json()
    } catch(error){
        console.log(error)
    }  
}

function calculate_rating(original_cc, original_acc, original_d) {
  if (original_cc.includes("+")){
    var cc = parseFloat(original_cc) + 0.7 || 0;
  } else {
    var cc = parseFloat(original_cc) || 0;
  }
  var acc = parseFloat(original_acc) || 0;
  var d = parseFloat(original_d) || 0;
  if (acc < 70) {
    var m =  -7
  }
  if (70 <= acc && acc <= 84) {
	var m = (84 - acc) / 20 * -7
  }
  if (84 <= acc && acc <= 86) {
    var m = 0
  }
  if (86 < acc && acc < 100) {
    var m = ((acc - 86) / 8) ** 3
  }
  if (acc === 100) {
    var m = 8
  }
  var rating = (cc + m) * 100 * (1 + d / 2) / 30
  return rating
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
                clone_difficultycard.querySelector(".rating").textContent = calculate_rating(constant, savedscores[songdata.id][difficulty]["accscore"], savedscores[songdata.id][difficulty]["dscore"]).toFixed(2)
            }
            clone_songcard.querySelector(".song_charts").appendChild(clone_difficultycard)
        }
        document.getElementById("song-container").appendChild(clone_songcard)
    }
    document.getElementById("song-container").addEventListener("change", update_localstorage)
}

function update_localstorage(event) {
  const row = event.target.closest(".difficulty")
  const songid = row.dataset.songId
  const difficulty = row.dataset.songDiff
  const rating_field = row.querySelector(".rating")
  const constant = row.querySelector(".difficulty_constant").textContent
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
  rating_field.textContent = calculate_rating(constant, savedscores[songid][difficulty]["accscore"], savedscores[songid][difficulty]["dscore"]).toFixed(2)
}

function calculate_rating_sum(){
  const rating_elements = document.querySelectorAll("#song-container .rating")
  const the_ratings = []
  for (const the_span of rating_elements){
    if (the_span.textContent == "") {
      continue;
    }
    const rating = parseFloat(the_span.textContent) || 0;
    the_ratings.push(rating)
    }
  the_ratings.sort((a, b) => b - a)
  let best_songs = the_ratings.slice(0, 30)
  const rating_sum = best_songs.reduce((total, rating) => total + rating, 0)
  console.log(best_songs)
  return rating_sum
}

function generate_image(){
  const rating_elements = document.querySelectorAll("#song-container .rating")
  const the_ratings = []
  for (const the_span of rating_elements){
    const rating = parseFloat(the_span.textContent) || 0;
    if (rating <= 0) {
      continue;
    }
    const row = the_span.closest(".difficulty")
    const card = the_span.closest(".song_card")
    const songid = row.dataset.songId
    const difficulty = row.dataset.songDiff
    const constant = row.querySelector(".difficulty_constant").textContent
    the_ratings.push({
      songId: songid,
      title: card.querySelector(".title").textContent,
      difficulty: difficulty,
      constant: constant,
      jacket: card.querySelector(".jacket").src,
      rating: rating
    })
  }
  const best_songs = the_ratings.sort((a, b) => b.rating - a.rating)
  console.log(calculate_rating_sum())
  console.log(best_songs)
}
init()