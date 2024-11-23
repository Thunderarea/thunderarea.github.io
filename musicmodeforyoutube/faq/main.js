document.addEventListener("DOMContentLoaded", () => {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const activeItem = document.querySelector(".accordion-item.active");

            if (activeItem && activeItem !== header.parentElement) {
                activeItem.classList.remove("active");
                activeItem.querySelector(".accordion-content").style.maxHeight = null;
            }

            header.parentElement.classList.toggle("active");
            const content = header.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            }  else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
