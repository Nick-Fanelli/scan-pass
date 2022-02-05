class Theme {

    constructor(offsetColor, darkOffsetColor, textColor, backgroundColor) {
        this.offsetColor = offsetColor;
        this.darkOffsetColor = darkOffsetColor;
        this.textColor = textColor;
        this.backgroundColor = backgroundColor;
    }

}

class LightTheme extends Theme {

    constructor() {
        super("#eeeeee", "#dddddd", "#000000", "#ffffff");
    }

}

class DarkTheme extends Theme {

    constructor() {
        super("#444444", "#333333", "#ffffff", "#222222");
    }

}

class ThemeSystem {

    static CurrentTheme = new LightTheme();

    static UpdateThemeItems() {
        document.getElementById("content-wrapper").style.backgroundColor = this.CurrentTheme.backgroundColor;
        document.getElementById("current-student-count").style.backgroundColor = this.CurrentTheme.darkOffsetColor;

        let colorThemeOffset = document.querySelectorAll(".color-theme-offset");

        colorThemeOffset.forEach((element) => {
            element.style.backgroundColor = this.CurrentTheme.offsetColor;
        });

        let textColor = document.querySelectorAll(".color-theme-text");

        textColor.forEach((element) => {
            element.style.color = this.CurrentTheme.textColor;  
        })

    }

    static SetTheme(theme) {
        this.CurrentTheme = theme;
        this.UpdateThemeItems();
    }

    static ToggleTheme() {
        if(this.CurrentTheme instanceof LightTheme) {
            this.SetTheme(new DarkTheme());
        } else {
            this.SetTheme(new LightTheme());
        }
    }

}

document.addEventListener("DOMContentLoaded", function() {
    ThemeSystem.UpdateThemeItems();
});