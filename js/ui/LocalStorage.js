// js/ui/LocalStorage.js
export function saveCharacter(char) {
    const data = JSON.stringify({
        name: char.name,
        strength: char.strength,
        agility: char.agility,
        constitution: char.constitution,
        weaponId: char.weapon?.id,
        backpackWeapons: char.backpack.weapons.map(w => w.id),
        backpackArmors: char.backpack.armors.map(a => a.id)
    });
    localStorage.setItem(`char_${char.name}`, data);
}

export function loadCharacters() {
    const chars = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('char_')) {
            const data = JSON.parse(localStorage.getItem(key));
            chars.push(data);
        }
    }
    return chars;
}