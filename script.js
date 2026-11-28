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
                if (parseFloat(clone_difficultycard.querySelector(".dscore").value) === 1){
                  clone_difficultycard.querySelector(".accscore").value = 100
                  clone_difficultycard.querySelector(".accscore").disabed = true
                }
                if (parseFloat(clone_difficultycard.querySelector(".accscore").value) === 100){
                  clone_difficultycard.querySelector(".fc").checked = true
                  clone_difficultycard.querySelector(".fc").disabled = true
                }
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
  if (parseFloat(event.target.value) === 100 && field === "accscore"){
    row.querySelector(".fc").checked = true
    savedscores[songid][difficulty]["fc"] = true
    row.querySelector(".fc").disabled = true
  }
  if ((parseFloat(event.target.value) < 100 || event.target.value === "") && field === "accscore"){
    row.querySelector(".fc").disabled = false
  }
  if (parseFloat(event.target.value) === 1 && field === "dscore"){
    row.querySelector(".accscore").value = 100
    savedscores[songid][difficulty]["accscore"] = 100
    row.querySelector(".accscore").disabled = true
    row.querySelector(".fc").checked = true
    savedscores[songid][difficulty]["fc"] = true
    row.querySelector(".fc").disabled = true
  }
  if ((parseFloat(event.target.value) < 1 || event.target.value === "") && field === "dscore"){
    row.querySelector(".accscore").disabled = false
    row.querySelector(".fc").disabled = false
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
    const accscore = row.querySelector(".accscore").value
    const dscore = row.querySelector(".dscore").value
    const fc = row.querySelector(".fc").checked
    const songid = row.dataset.songId
    const difficulty = row.dataset.songDiff
    const constant = row.querySelector(".difficulty_constant").textContent
    the_ratings.push({
      songId: songid,
      title: card.querySelector(".title").textContent,
      difficulty: difficulty,
      constant: constant,
      jacket: card.querySelector(".jacket").src,
      accscore: accscore,
      dscore: dscore,
      fc: fc,
      rating: rating
    })
  }
  const template_playerinfo = document.getElementById("player_info")
  const clone_template_playerinfo = template_playerinfo.content.cloneNode(true)
  clone_template_playerinfo.querySelector(".player_name").textContent = document.getElementById("playername_input").value
  clone_template_playerinfo.querySelector(".player_rating").textContent = calculate_rating_sum()
  document.getElementById("img_player_info").appendChild(clone_template_playerinfo)
  const template_rankcard = document.getElementById("song_ranks")
  const best_songs = the_ratings.sort((a, b) => b.rating - a.rating)
  const top_30 = best_songs.slice(0, 30) 
  for (const [rank, data] of Object.entries(top_30)){
    const clone_rankcard = template_rankcard.content.cloneNode(true) 
    clone_rankcard.querySelector(".image_title").textContent = data.title
    clone_rankcard.querySelector(".image_rank").textContent = parseFloat(rank) + 1
    clone_rankcard.querySelector(".image_accscore").textContent = data.accscore
    clone_rankcard.querySelector(".image_dscore").textContent = data.dscore
    clone_rankcard.querySelector(".image_rating").textContent = data.rating
    clone_rankcard.querySelector(".image_difficulty_name").textContent = data.difficulty
    clone_rankcard.querySelector(".image_difficulty_name").dataset.songDiff = data.difficulty
    clone_rankcard.querySelector(".image_constant").textContent = data.constant
    clone_rankcard.querySelector(".image_jacket").src = data.jacket
    if (parseFloat(data.accscore) === 100){
      if (parseFloat(data.dscore) === 1){
        clone_rankcard.querySelector(".image_jacket").style = "border: 5px solid red; border-image: linear-gradient(to right, #f0207a, #0f3cff); border-image-slice: 1;"
      } else {
        clone_rankcard.querySelector(".image_jacket").style = "border: 5px solid red; border-image: linear-gradient(to right, #d4ff00, #ff8c00); border-image-slice: 1;"
      }
    }
    else if (data.fc === true || data.fc === "true"){
      clone_rankcard.querySelector(".image_jacket").style  = "border: 5px solid #00aeff; border-image-slice: 1;"
    }
    document.getElementById("img_best_songs").appendChild(clone_rankcard)
  }
  const generatebutton = document.getElementById("generatebutton")
  generatebutton.hidden = ""
  const downloadbutton = document.getElementById("downloadbutton").content.cloneNode(true)
  document.appendChild(downloadbutton)
}
init()