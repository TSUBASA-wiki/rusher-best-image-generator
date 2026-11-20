async function loadJSON() {
    try{
        const response = await fetch("./songs.json")
        return await response.json()
    } catch(error){
        console.log(error)
    }  
}

