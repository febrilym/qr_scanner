const generatorTab = document.querySelector(".nav-generator");
const scannerTab = document.querySelector(".nav-scanner");

generatorTab.addEventListener("click", () => {
    generatorTab.classList.add("active");
    scannerTab.classList.remove("active");

    document.querySelector(".scanner").style.display = "none";
    document.querySelector(".generator").style.display = "block";
})

scannerTab.addEventListener("click", () => {
    scannerTab.classList.add("active");
    generatorTab.classList.remove("active");
    
    document.querySelector(".scanner").style.display = "block";
    document.querySelector(".generator").style.display = "none";
})