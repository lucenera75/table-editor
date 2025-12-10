function enableRcPagination() {

    // Remove all toolbars
    function removeAllToolbars() {
        document
            .querySelectorAll(".rc-pagination-toolbar")
            .forEach((bar) => bar.remove());
    }

    // build toolbar at given edge with given items
    function makeBar(page, edge, items) {
        const bar = document.createElement("div");
        bar.className = `rc-pagination-toolbar`;
        Object.assign(bar.style, {
            position: "absolute",
            [edge]: "10px",
            left: "10px",
            display: "flex",
            gap: "8px",
            pointerEvents: "auto",
            userSelect: "none",
            zIndex: 1000,
        });

        items.forEach((item) => {
            const btn = document.createElement("button");
            btn.dataset.cmd = item.cmd;
            btn.textContent = `${item.icon} ${item.label}`;
            Object.assign(btn.style, {
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                fontSize: "0.85rem",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                background: "linear-gradient(135deg, #4a90e2, #357abd)",
                transition: "background 0.2s, transform 0.1s",
            });
            btn.addEventListener("mouseenter", () => {
                btn.style.background =
                    "linear-gradient(135deg, #3b7ccc, #2a5fb4)";
                btn.style.transform = "translateY(-1px)";
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.background =
                    "linear-gradient(135deg, #4a90e2, #357abd)";
                btn.style.transform = "";
            });
            btn.addEventListener("mousedown", () => {
                btn.style.background =
                    "linear-gradient(135deg, #316cb0, #23538f)";
                btn.style.transform = "";
            });
            bar.appendChild(btn);
        });

        // click delegation
        bar.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-cmd]");
            if (!btn) return;
            const cmd = btn.dataset.cmd;
            if (cmd === "remove") {
                removePage(page);
            } else {
                const [type, dir] = cmd.split("-");
                addPage(
                    page,
                    type === "p" ? "portrait" : "landscape",
                    dir === "up"
                );
            }
        });

        page.appendChild(bar);
    }

    // toolbar factory
    function createToolbar(page) {
        removeAllToolbars();
        page.style.position = "relative";
        makeBar(page, "top", [
            { cmd: "p-up", icon: "▲", label: "Portrait Before" },
            { cmd: "l-up", icon: "▲", label: "Landscape Before" },
            { cmd: "remove", icon: "✖", label: "Remove Page" },
        ]);
        makeBar(page, "bottom", [
            { cmd: "p-down", icon: "▼", label: "Portrait After" },
            { cmd: "l-down", icon: "▼", label: "Landscape After" },
            { cmd: "remove", icon: "✖", label: "Remove Page" },
        ]);
    }

    // insert new page
    function addPage(ref, orientation, up = true) {
        const np = document.createElement("div");
        np.className = `rc-body${
            orientation === "landscape" ? "-landscape" : ""
        } print-margin-visual ${orientation}-content`;
        np.setAttribute("data-orientation", orientation);
        np.contentEditable = true;

        // clone header/footer
        ["rc-header-logo", "rc-footer-general"].forEach((cn) => {
            const o = ref.querySelector(`.${cn}`);
            if (o) np.appendChild(o.cloneNode(true));
        });
        np.insertAdjacentHTML(
            "beforeend",
            "<p>This is a new page. Edit away!</p>"
        );

        const parent = ref.parentNode;
        if (up) parent.insertBefore(np, ref);
        else parent.insertBefore(np, ref.nextSibling);
    }

    // remove page
    function removePage(page) {
        page.remove();
    }

    // Only add click listener to show toolbar
    document.querySelectorAll("[contenteditable]").forEach((page) => {
        page.addEventListener("click", (e) => {
            // Prevent toolbar from showing when clicking the toolbar itself
            if (e.target.closest(".rc-pagination-toolbar")) return;
            createToolbar(page);
        });
    });
}

window.enableRcPagination = enableRcPagination;