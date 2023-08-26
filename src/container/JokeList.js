/** @format */

import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "../components/Joke";
import "./JokeList.css";

function JokeList({ numJokesToGet = 5 }) {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleLock = (id) => {
    setJokes((prevJokes) =>
      prevJokes.map((joke) =>
        joke.id === id ? { ...joke, isLocked: !joke.isLocked } : joke
      )
    );
    setLocalStorage(jokes); // Update local storage after toggling lock
  };

  const getLocalStorage = () => {
    return JSON.parse(localStorage.getItem("jokes"));
  };

  const setLocalStorage = (arr) => {
    localStorage.setItem("jokes", JSON.stringify(arr));
  };

  function resetVotes() {
    const resetJokes = jokes.map((j) => (j.isLocked ? j : { ...j, votes: 0 }));
    setJokes(resetJokes);
    setLocalStorage(resetJokes);
  }

  useEffect(() => {
    setJokes(getLocalStorage());
  }, []);

  useEffect(
    function () {
      async function getJokes() {
        let j = [...jokes];
        let seenJokes = new Set();
        try {
          while (j.length < numJokesToGet) {
            let res = await axios.get("https://icanhazdadjoke.com", {
              headers: { Accept: "application/json" },
            });
            let { ...jokeObj } = res.data;

            if (!seenJokes.has(jokeObj.id)) {
              seenJokes.add(jokeObj.id);
              j.push({ ...jokeObj, votes: 0, isLocked: false });
            } else {
              console.error("duplicate found!");
            }
          }
          setJokes(j);
          setIsLoading(false);
        } catch (err) {
          console.error(err);
        }
      }

      if (jokes.length < numJokesToGet) getJokes();
    },
    [jokes, numJokesToGet]
  );

  function generateNewJokes() {
    const lockedJokes = jokes.filter((j) => j.isLocked === true);
    setJokes(lockedJokes);
    setIsLoading(true);
  }

  function vote(id, delta) {
    setJokes((allJokes) =>
      allJokes.map((j) => (j.id === id ? { ...j, votes: j.votes + delta } : j))
    );
    setLocalStorage(jokes);
  }

  if (isLoading) {
    return (
      <div className="loading">
        <i className="fas fa-4x fa-spinner fa-spin" />
      </div>
    );
  }

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);
  setLocalStorage(sortedJokes);

  const allJokesAreLocked = jokes.every((joke) => joke.isLocked);

  return (
    <div className="JokeList">
      <button
        className="JokeList-getmore"
        onClick={generateNewJokes}
        disabled={allJokesAreLocked}
      >
        Get New Jokes
      </button>
      <button className="JokeList-reset" onClick={resetVotes}>
        Reset Votes
      </button>

      {sortedJokes.map(({ joke, id, votes, isLocked }) => (
        <Joke
          text={joke}
          key={id}
          id={id}
          votes={votes}
          vote={vote}
          isLocked={isLocked}
          toggleLock={() => toggleLock(id)}
        />
      ))}
    </div>
  );
}

export default JokeList;
