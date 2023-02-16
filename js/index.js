document.addEventListener("DOMContentLoaded", () => {
  const $heading = document.querySelector("#section-introduce > h1");
  const $items = document.querySelectorAll("#section-introduce > ul > li");
  $heading.style.visibility = "hidden";
  $items.forEach(($item) => ($item.style.visibility = "hidden"));

  playTypingAnimation($heading, 100)
    .then(() => delay(500))
    .then(() => {
      return [...$items].reduce(
        (promise, $item) =>
          promise
            .then(() => playFastTypingAnimation($item, 20))
            .then(() => delay(200)),
        new Promise((resolve) => resolve())
      );
    });

  fetch("/data/movies.json")
    .then((response) => response.json())
    .then((movies) => {
      movies.forEach((movie, index) => {
        const rank = index + 1;
        createMovie(movie, rank);
      });

      selectMovie(movies[0]);

      new IntersectionObserver(
        (entries, observer) => {
          const isIntersecting = entries.some((entry) => entry.isIntersecting);
          const $backdropTrailer = document.querySelector("#backdrop-trailer");

          $backdropTrailer.style.opacity = isIntersecting ? 1 : 0;
        },
        {
          threshold: 0.5,
        }
      ).observe(document.querySelector("#section-movies"));
    });

  fetch("/data/skills.json")
    .then((response) => response.json())
    .then((skills) => {
      skills.forEach((skill) => {
        createSkill(skill);
      });

      ["frontend", "backend", "devops"].forEach((tag) => {
        document
          .getElementById(`filter-${tag}`)
          .addEventListener("click", () => {
            emphasizeSkills(skills.filter((skill) => skill.tags.includes(tag)));
          });
      });

      new IntersectionObserver(
        (entries, observer) => {
          const isIntersecting = entries.some((entry) => entry.isIntersecting);
          const $introducePlanetary = document.getElementById(
            "introduce-planetary"
          );

          $introducePlanetary.style.opacity = isIntersecting ? 1 : 0.1;
        },
        {
          threshold: 0.1,
        }
      ).observe(document.getElementById("section-introduce"));
    });
});

function selectMovie(movie) {
  const {
    id,
    color,
    poster_path,
    naver_movie_id,
    vote_average,
    vote_count,
    title,
    overview,
    youtube_trailer_id,
  } = movie;
  const $moviePoster = document.querySelector("#movie-poster");
  const $movieLink = document.querySelector("#movie-link");
  const $movieVoteAverage = document.querySelector("#movie-vote-average");
  const $movieVoteCount = document.querySelector("#movie-vote-count");
  const $movieDescriptionTitle = document.querySelector(
    "#movie-description > h2"
  );
  const $movieDescriptionOverview = document.querySelector(
    "#movie-description > p"
  );
  const $backdropTrailer = document.querySelector("#backdrop-trailer");

  document.querySelector(":root").style.setProperty("--movie-color", color);

  $moviePoster.setAttribute(
    "src",
    `https://image.tmdb.org/t/p/w600_and_h900_bestv2${poster_path}`
  );
  $movieLink.setAttribute(
    "href",
    `https://movie.naver.com/movie/bi/mi/basic.naver?code=${naver_movie_id}`
  );
  $movieVoteAverage.innerText = vote_average.toFixed(1);
  $movieVoteCount.innerText = vote_count;
  $movieDescriptionTitle.innerText = title;
  $movieDescriptionOverview.innerText = overview;

  $backdropTrailer.setAttribute(
    "src",
    `https://www.youtube.com/embed/${youtube_trailer_id}?autoplay=1&mute=1&showinfo=0&controls=0&playlist=${youtube_trailer_id}&loop=1&start=10`
  );
}

function createMovie(movie, rank) {
  const { id, title, overview, poster_path } = movie;

  const $tr = document.createElement("tr");
  $tr.classList.add("movie-data");
  $tr.setAttribute("data-id", id);
  $tr.setAttribute("data-rank", rank);

  const $rank = document.createElement("td");
  $rank.innerText = rank;
  $rank.classList.add("rank");
  $tr.appendChild($rank);

  const $poster = document.createElement("td");
  const $posterImage = document.createElement("img");
  $posterImage.setAttribute("width", 160);
  $posterImage.setAttribute(
    "src",
    `https://image.tmdb.org/t/p/w600_and_h900_bestv2${poster_path}`
  );
  $poster.appendChild($posterImage);
  $tr.appendChild($poster);

  const $title = document.createElement("td");
  $title.innerText = title;
  $title.classList.add("title");
  $tr.appendChild($title);

  const $overview = document.createElement("td");
  $overview.innerText = overview;
  $overview.classList.add("overview");
  $tr.appendChild($overview);

  document.querySelector("#movies > tbody").appendChild($tr);

  const $movie = document.createElement("li");
  const $movieImage = document.createElement("img");
  $movieImage.setAttribute(
    "src",
    `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movie.poster_path}`
  );
  $movieImage.setAttribute("width", 80);
  $movie.appendChild($movieImage);
  $movie.addEventListener("click", () => {
    selectMovie(movie);
  });

  const $movieList = document.querySelector("#movie-list");
  $movieList.appendChild($movie);

  const $visitlogMovies = document.getElementById("visitlog-movies");

  const $checkbox = document.createElement("input");
  $checkbox.setAttribute("type", "checkbox");
  $checkbox.setAttribute("id", id);
  $checkbox.setAttribute("name", id);
  $visitlogMovies.appendChild($checkbox);

  const $label = document.createElement("label");
  $label.setAttribute("for", id);
  $label.innerText = title;
  $visitlogMovies.appendChild($label);
}

function createSkill(skill) {
  const { name, type, color, tags } = skill;

  const $star = document.createElement("figure");
  $star.setAttribute("name", name);
  $star.setAttribute("class", "star");
  $star.style.setProperty("--rotation-offset", Math.random() * 360);
  $star.style.top = `${Math.random() * 800 - 400}px`;
  $star.style.filter = `drop-shadow(0 0 0.5rem ${color})`;

  const $starImage = document.createElement("img");
  $starImage.setAttribute("src", `/images/icons/${name.toLowerCase()}.svg`);

  const $starTitle = document.createElement("div");
  $starTitle.innerText = name;

  $star.appendChild($starImage);
  $star.appendChild($starTitle);

  const $stars = document.getElementById("introduce-planetary-stars");
  $stars.appendChild($star);
}

function emphasizeSkills(skills) {
  const skillNames = new Set(skills.map((skill) => skill.name));
  document.querySelectorAll(".star").forEach(($star) => {
    $star.style.opacity = skillNames.has($star.getAttribute("name")) ? 1 : 0.1;
  });
}

function submitVisitlog(event) {
  event.preventDefault();

  const name = document.querySelector('input[name="visitlog-user"]').value;
  const count = document.querySelectorAll(
    '#visitlog-movies > input[type="checkbox"]:checked'
  ).length;
  alert(`${name}님, 저와 ${count}개의 취향이 같으시네요!`);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playTypingAnimation($element, interval) {
  const text = $element.innerHTML;
  $element.style.visibility = "hidden";

  const typedChars = [];
  const remainChars = Hangul.disassemble(text);

  while (remainChars.length > 0) {
    typedChars.push(remainChars.shift());
    const typedText = Hangul.assemble(typedChars);
    $element.innerText = typedText;
    $element.style.visibility = "visible";

    await delay(interval);
  }
}

async function playFastTypingAnimation($element, interval) {
  const text = $element.innerHTML;
  $element.style.visibility = "hidden";

  const typedChars = [];
  const remainChars = text.split("");

  while (remainChars.length > 0) {
    typedChars.push(remainChars.shift());
    $element.innerText = typedChars.join("");
    $element.style.visibility = "visible";

    await delay(interval);
  }
}
