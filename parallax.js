function updateStyle(elem) {
	const maxTime = 241;
	const shadow = elem.shadowRoot;

	const img = elem.getAttribute("img");
	const speed = elem.getAttribute("speed");
	shadow.querySelector("style").textContent = `
		div {
			animation: slideshow ${maxTime - speed}s linear infinite;
			background-image: url(${img});
			position: absolute;
			width: 450%;
			height: 100%;
			bottom: 0;
			background-repeat: repeat-x;
			background-size: 25% 100%;
			pointer-events: none;
		}
		@keyframes slideshow {
			0% {
				transform: translateX(0%);
			}
			100% {
				transform: translateX(-50%);
			}
		}
	`;
}

class Layer extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({ mode: "open" });
		const div = document.createElement("div");
		const style = document.createElement("style");
		shadow.appendChild(style);
		shadow.appendChild(div);
	}

	static get observedAttributes() {
		return ["speed", "img"];
	}

	connectedCallback() {
		updateStyle(this);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		updateStyle(this);
	}
}

class Parallax extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: "open" });

		const content = document.createElement('div');
		content.classList.add("content");

		const parallax = document.createElement('div');
		parallax.classList.add("parallax-window");


		let style = document.createElement("style");
		style.textContent = `
			.content {
				position: relative;
				width: 100%;
				padding-bottom: 56.25%;
				/* maintain a 16:9 aspect ratio for the 320p base images */
				justify-content: center;
			}
			.parallax-window {
				position: absolute;
				width: 100%;
				height: 100%;
				overflow: hidden;
				background-size: cover;
				background-position: center;
				pointer-events: none;
			}
		`;

		shadow.appendChild(style);
		shadow.appendChild(content);
		content.appendChild(parallax);

		const callback = (mutationList, observer) => {
			for (const mutation of mutationList) {
				if (mutation.type === "childList") {
					let elem = mutation.addedNodes[0];
					if (elem?.localName === "parallax-layer") {
						console.log("A child parallax-layer node has been added or removed.");
						parallax.appendChild(elem);
					}
				}
			}
		};
		const config = { attributes: true, childList: true, subtree: true };

		this.observer = new MutationObserver(callback);
		this.observer.observe(this, config);
	}

	disconnectedCallback() {
		this.observer.disconnect();
	}
}

if (!window.customElements.get("parallax-layer")) {
	window.customElements.define("parallax-layer", Layer);
}
if (!window.customElements.get("parallax-window")) {
	window.customElements.define("parallax-window", Parallax);
}
