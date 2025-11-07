// Creates the DOM elements required to display the carousel
function quickBuildImgCarousel(parent, imgSrcArr, leftArrowSrc, rightArrowSrc) {
    const container = document.createElement("div");
    container.classList.add("carousel-container");
    parent.appendChild(container);

    const content = document.createElement("div");
    content.classList.add("carousel-content");
    container.appendChild(content);

    const carouselDiv = document.createElement("div");
    carouselDiv.classList.add("carousel");
    content.appendChild(carouselDiv);

    const wideImgDiv = createImgDiv(imgSrcArr);
    carouselDiv.appendChild(wideImgDiv);

    const prevButton = createImgButton(wideImgDiv, prevSlide, leftArrowSrc);
    content.insertBefore(prevButton, carouselDiv);

    const nextButton = createImgButton(wideImgDiv, nextSlide, rightArrowSrc);
    content.appendChild(nextButton);

    const navDiv = createNavDots(wideImgDiv);
    container.appendChild(navDiv);

    goToSlide(wideImgDiv, 0);
    setInterval(() => nextSlide(wideImgDiv), 5000);
}

// Creates a div containing the images specified in the array
// Images can be separated by a distance indicated by gap
function createImgDiv(imgSrcArr) {
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("wide-container");

    for (let i = 0; i < imgSrcArr.length; i++) {
        const img = document.createElement("img");
        img.src = imgSrcArr[i];
        img.classList.add("carousel");
        imgDiv.appendChild(img);
    }

    return imgDiv;
}

// Creates an img and attaches a click EventListener so it acts
// like a button performing the specified function
function createImgButton(target, func, imgSrc, className = "carousel-btn") {
    const imgBtn = document.createElement("img");
    imgBtn.src = imgSrc;
    imgBtn.classList.add(className);
    imgBtn.addEventListener("click", () => func(target));
    return imgBtn;
}

// Creates n navDots that go to the nth slide position when clicked
function createNavDots(target) {
    const navDiv = document.createElement("div");
    navDiv.classList.add("carousel-nav");

    for (let i = 0; i < target.children.length; i++) {
        const navDot = document.createElement("span");
        navDot.classList.add("nav-dot");

        navDot.addEventListener("click", (e) => {
            const slideContainer = document.querySelector(".wide-container");
            const children = Array.from(e.target.parentNode.children);
            goToSlide(slideContainer, children.indexOf(e.target));
        });

        navDiv.appendChild(navDot);
    }

    return navDiv;
}

// Move to the next slide of the target container
// Assuming images of same width
function nextSlide(target) {
    const offsetArr = getChildrenOffsetLeft(target);
    const i = getSlideIndex(target);
    if (i === -1) {
        return;
    } else if (i === offsetArr.length - 1) {
        goToSlide(target, 0);
    } else {
        goToSlide(target, i + 1);
    }
}

// Move to the previous slide of the target container
function prevSlide(target) {
    const childrenSize = target.children.length;
    const i = getSlideIndex(target);
    if (i === -1) {
        return;
    } else if (i === 0) {
        goToSlide(target, childrenSize - 1);
    } else {
        goToSlide(target, i - 1);
    }
}

// Sets the position of the target container to the ith slide
// i starts at 0
function goToSlide(target, i) {
    const offsetArr = getChildrenOffsetLeft(target);
    target.style.setProperty("right", offsetArr[i] + "px");

    const navChildren = document.querySelectorAll(".nav-dot");

    removeNavDotStyle(navChildren, navChildren[i]);
    navChildren[i].classList.add("selected"); // style active dot
}

// Returns index of active slide under target parent
function getSlideIndex(target) {
    const offsetArr = getChildrenOffsetLeft(target);

    let currentOffset = window.getComputedStyle(target).right;
    const firstNumMatch = /\d+/; // Returns first number in string
    currentOffset = parseInt(currentOffset.match(firstNumMatch)[0]);

    return offsetArr.findIndex((e) => e === currentOffset);
}

// Returns the offset-left property values of the target element's children
function getChildrenOffsetLeft(target) {
    const offsetArr = [];
    for (let child of target.children) {
        offsetArr.push(child.offsetLeft);
    }
    return offsetArr;
}

// Removes styling from all child elements of target
function removeNavDotStyle(array, exception = null) {
    for (let i = 0; i < array.length; i++) {
        let child = array[i];
        if (!(exception === child)) {
            child.classList.remove("selected");
        }
    }
}

export { quickBuildImgCarousel };
