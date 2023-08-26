/** @format */

import React from "react";
import "./Joke.css";

const Joke = ({ vote, votes, text, id, isLocked, toggleLock }) => {
  const upVote = () => {
    vote(id, +1);
  };
  const downVote = () => {
    vote(id, -1);
  };

  const lockIcon = isLocked ? (
    <i className="fas fa-lock" onClick={() => toggleLock(id)} />
  ) : (
    <i className="fas fa-unlock" onClick={() => toggleLock(id)} />
  );

  return (
    <div className="Joke">
      {lockIcon}
      <div className="Joke-votearea">
        <button onClick={upVote}>
          <i className="fas fa-thumbs-up" />
        </button>
        <button onClick={downVote}>
          <i className="fas fa-thumbs-down" />
        </button>
        {votes}
      </div>
      <div>
        <div className="Joke-text">{text}</div>
      </div>
    </div>
  );
};

export default Joke;
