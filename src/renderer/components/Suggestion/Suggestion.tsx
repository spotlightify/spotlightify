import logo from 'assets/svg/spotify-logo.svg';

function Suggestion() {
  return (
    <div className="suggestion-item">
      <img className="suggestion-item__icon" src={logo} alt="spotify logo" />
      <div className="suggestion-text-wrapper">
        <div className="suggestion-item__title">Do I wanna know</div>
        <div className="suggestion-item__description">By Arctic Monkeys</div>
      </div>
    </div>
  );
}

export default Suggestion;
