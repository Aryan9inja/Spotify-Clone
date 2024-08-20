let currSong = new Audio();
let play = document.getElementById("Play");
let pause = document.getElementById("Pause");
let previous = document.getElementById("Previous");
let next = document.getElementById("Next");
let songs;
let currFolder;

// Function to display albums on the webpage in the playlist section
async function display_albums() {
  // Getting song folder names from the internal folder Songs
  let data = await fetch("Songs/");
  let response = await data.text();

  // Creating a temporary div element to store the response from above
  let div = document.createElement("div");
  div.innerHTML = response;

  // Retrieving all links from the div response and adding them to an array
  let a_tag = div.getElementsByTagName("a");
  let array = Array.from(a_tag);

  // Selecting the part of webpage where all the Albums are to be displayed
  let AlbumContainer = document.querySelector(".YourSongs");

  // Adding every album on the webpage by looping through the array created earlier
  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    // Checks if the link will be from the folder required or not
    if (element.href.includes("Songs/")) {
      // Retrieve the name of folder from the link
      // .split splits the link into two parts before and after the "/"
      // .slice(-2)[0] create an array from the end with two elements of which first is selected that is the folder name
      let folder = element.href.split("/").slice(-2)[0];

      // Get mata-deta from the folder
      let a = await fetch(`Songs/${folder}/data.json`);
      let response = await a.json();

      // Append the Album onto the Album container
      let Album = document.createElement("div");
      Album.classList.add("Album", "bg-two");
      Album.innerHTML = `<img
                src="Assets/wp5709607-hacker-desktop-4k-wallpapers.jpg"
                alt=""
              />
              <div class="name color-one flex align-center justify-center bg-one">
                ${response.title}
              </div>`;

      Album.addEventListener("click", async function () {
        await getSongs(`Songs/${folder}`);
        playSongs(songs[0]);
        play.style.display = "none";
        pause.style.display = "block";
        document.querySelector(".Naming").innerHTML = decodeURIComponent(
          currSong.src.split(`/${currFolder}/`)[1].replace(".mp3", "")
        );
      });

      AlbumContainer.appendChild(Album);
    }
  }
}

// function to get songs from a specific folder
async function getSongs(folder) {
  currFolder = folder;
  // Getting songs name from a specific folder
  let data = await fetch(`${folder}/`);
  let response = await data.text();

  // Creating a temporary div element to store the response from above
  let div = document.createElement("div");
  div.innerHTML = response;

  // Retrieving all links from the div response and adding them to an array
  let a_tag = div.getElementsByTagName("a");
  let array = Array.from(a_tag);

  // Empty array to store song names
  songs = [];

  // song_list is the element on webpage where song names are to be displayed
  const song_list = document.querySelector(".song_list ul");
  song_list.innerHTML = "";

  // Adding song names to song array
  for (let index = 0; index < array.length; index++) {
    const element = array[index];

    // Checks if the link ends with .mp3 that is a audio file
    if (element.href.endsWith(".mp3")) {
      // decodeURIComponenet to retrieve song name without symbols for space like %20
      // The link is seprated into two parts before and after folder name, we use the second part as it is the one that contains the song name
      songs.push(decodeURIComponent(element.href.split(`/${folder}/`)[1]));
    }
  }

  // Appending every song to the soong list
  songs.forEach((song) => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="Assets/wp5709607-hacker-desktop-4k-wallpapers.jpg" alt="">${song.replace(
      ".mp3",
      ""
    )}`;
    li.classList.add("bg-two");

    // Adding a click event listener to every song name element
    li.addEventListener("click", function () {
      currSong.src = `${folder}/${song}`;
      currSong.play();

      play.style.display = "none";
      pause.style.display = "block";

      document.querySelector(".Naming").innerHTML = song.replace(".mp3", "");
    });

    song_list.appendChild(li);
  });
  return songs;
}

function playSongs(track, pause = false) {
  currSong.src = `${currFolder}/${track}`;
  if (!pause) {
    currSong.play();
  }
}

function SecondsToMinute_Seconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  let formattedMinutes = String(minutes).padStart(2, "0");
  let formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function main() {
  await getSongs("Songs/S");
  playSongs(songs[0], true);

  await display_albums();
  pause.addEventListener("click", function () {
    currSong.pause();

    pause.style.display = "none";
    play.style.display = "block";
  });

  play.addEventListener("click", function () {
    currSong.play();
    play.style.display = "none";
    pause.style.display = "block";
  });

  previous.addEventListener("click", function () {
    let index = songs.indexOf(
      decodeURIComponent(currSong.src.split("/").slice(-1)[0])
    );
    playSongs(songs[index - 1]);
    document.querySelector(".Naming").innerHTML = decodeURIComponent(
      currSong.src.split(`/${currFolder}/`)[1].replace(".mp3", "")
    );

    play.style.display = "none";
    pause.style.display = "block";
  });

  next.addEventListener("click", function () {
    let index = songs.indexOf(
      decodeURIComponent(currSong.src.split("/").slice(-1)[0])
    );
    playSongs(songs[index + 1]);
    document.querySelector(".Naming").innerHTML = decodeURIComponent(
      currSong.src.split(`/${currFolder}/`)[1].replace(".mp3", "")
    );

    play.style.display = "none";
    pause.style.display = "block";
  });

  document.getElementById("Bar1").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.getElementById("Ball1").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  document.querySelector(".song_time").innerHTML = `${SecondsToMinute_Seconds(
    currSong.currentTime
  )} /
    ${SecondsToMinute_Seconds(currSong.duration)}`;
  currSong.addEventListener("timeupdate", function () {
    document.querySelector(".song_time").innerHTML = `${SecondsToMinute_Seconds(
      currSong.currentTime
    )} /
      ${SecondsToMinute_Seconds(currSong.duration)}`;

    document.getElementById("Ball1").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  let last_volume = currSong.volume;
  const volumeIcon = document.querySelector(".volume_control>img");
  document.querySelector(".volumeBar").addEventListener("click", (e) => {
    let vol = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".volumeBarBall").style.left = vol + "%";
    currSong.volume = vol / 100;

    if (currSong.volume === 0) {
      volumeIcon.src = volumeIcon.src.replace(
        /(High|Low)_Stroke\.svg/,
        "Off_Stroke.svg"
      );
      is_mute = true;
    } else if (currSong.volume < 0.5) {
      volumeIcon.src = volumeIcon.src.replace(
        /(High|Off)_Stroke\.svg/,
        "Low_Stroke.svg"
      );
    } else {
      volumeIcon.src = volumeIcon.src.replace(
        /(Low|Off)_Stroke\.svg/,
        "High_Stroke.svg"
      );
    }

    if (currSong.volume > 0) {
      last_volume = currSong.volume;
    }
  });

  volumeIcon.addEventListener("click", () => {
    if (currSong.volume > 0) {
      last_volume = currSong.volume;
      currSong.volume = 0;
      volumeIcon.src = volumeIcon.src.replace(
        /(High|Low)_Stroke\.svg/,
        "Off_Stroke.svg"
      );
      document.querySelector(".volumeBarBall").style.left = "0%";
    } else {
      currSong.volume = last_volume;
      document.querySelector(".volumeBarBall").style.left =
        currSong.volume * 100 + "%";
    }

    if (currSong.volume < 0.5 && currSong.volume > 0) {
      volumeIcon.src = volumeIcon.src.replace(
        /(High|Off)_Stroke\.svg/,
        "Low_Stroke.svg"
      );
    } else if (currSong.volume > 0.5) {
      volumeIcon.src = volumeIcon.src.replace(
        /(Low|Off)_Stroke\.svg/,
        "High_Stroke.svg"
      );
    }
  });

  document.querySelector(".Naming").innerHTML = decodeURIComponent(
    currSong.src.split(`/${currFolder}/`)[1].replace(".mp3", "")
  );

  document.getElementById("Hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "1%";
  });

  document.getElementById("cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-96%";
  });
}

main();
