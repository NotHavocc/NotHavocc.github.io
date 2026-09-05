const DISCORD_ID = '622775874252570634';
const sections = document.querySelectorAll('.window');
const navLinks = document.querySelectorAll('.taskbar-app');

async function updateAboutDiscord() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
        const data = await res.json();
        
        if (data.success) {
            const d = data.data;
            const user = d.discord_user;
            
            const avatar = user.avatar 
                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64` 
                : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
            
            const name = user.global_name || user.username;
            const custom = d.activities.find(a => a.type === 4);
            const statusText = custom ? custom.state : 'No custom status';

            const activity = d.activities.find(a => a.type !== 4);
            let activityText = '';
            if (activity) {
                const type = activity.type === 2 ? 'Listening to' : 
                             activity.type === 1 ? 'Streaming' : 
                             activity.type === 3 ? 'Watching' : 'Playing';
                activityText = `${type} ${activity.name}`;
            }

            const discordStatus = d.discord_status;

            const container = document.getElementById('about-discord-status');
            if (container) {
                container.innerHTML = `
                    <div class="about-discord-inner">
                        <div class="about-discord-avatar-wrapper">
                            <img src="${avatar}" class="about-discord-avatar" alt="Avatar">
                            <div class="about-status-indicator ${discordStatus}"></div>
                        </div>
                        <div class="about-discord-info">
                            <div class="about-discord-name">${name}</div>
                            <div class="about-discord-status-text">${statusText}</div>
                            <div class="about-discord-status-text">${activityText}</div>
                        </div>
                    </div>
                `;
            }
        }
    } catch (e) { 
        console.error("Discord fetch error:", e); 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('startup-overlay');
    const audio = document.getElementById('win98-audio');
    audio.volume = 0.5; 

    overlay.addEventListener('click', () => {
        audio.play().catch(error => {
            console.log("Audio playback failed:", error);
        });

        overlay.classList.add('fade-out');

        setTimeout(() => {
            overlay.style.display = 'none';
        }, 1000); 
    });
});

function updateWin98Clock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const clockEl = document.getElementById('win98-clock');
    if (clockEl) {
        clockEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
}

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current) && current !== '') {
            link.classList.add('active');
        }
    });
});

updateAboutDiscord();
setInterval(updateAboutDiscord, 30000);

updateWin98Clock();
setInterval(updateWin98Clock, 1000);