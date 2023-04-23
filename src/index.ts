import { html, render } from 'lit-html';

type Degree = 1 | 2 | 3 ;

const colorMapping = ["#000", "#00e", "#e00"];
const shapeShadeMapping = ["■▣□", "●◎○", "◆◈◇"];

class Card {
    // note the convenient TypeScript constructor that implicitly creates
    // attributes.
    constructor(
        readonly shape: Degree,
        readonly count: Degree,
        readonly shade: Degree,
        readonly color: Degree,
    ) {}

    render({selected}) {
        const colorAttr = colorMapping[this.color - 1];
        const shapeShade = shapeShadeMapping[this.shape - 1][this.shade - 1];
        const selectedClass = selected ? "card-selected" : "card-inactive";
        return (
            html`<button
                style="color: ${colorAttr};"
                class="${selectedClass}"
                @click=${() => gameSelectCard(this)}
            >
                ${[...Array(this.count).keys()].map(_ => shapeShade)}
            </button>`
        );
    }
}

function newDeck(): Card[] {
    let cards = new Array<Card>();
    for (const shape of [1, 2, 3]) {
        for (const count of [1, 2, 3]) {
            for (const shade of [1, 2, 3]) {
                for (const color of [1, 2, 3]) {
                    cards.push(new Card(
                        shape as Degree,
                        count as Degree,
                        shade as Degree,
                        color as Degree
                    ));
                }
            }
        }
    }
    return cards;
}

/**
 * Fisher-Yates Shuffle
 */
function shuffle<T>(xs: T[]): void {
    let currentIndex = xs.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [xs[currentIndex], xs[randomIndex]] = [
        xs[randomIndex], xs[currentIndex]];
    }
}

/**
 * Transfer `count` items from `src` to `dest`.
 */
function deal<T>(src: T[], count: Number, dest: T[]) {
    console.log("deal: not implemented yet");
}

function renderTable(cards: Card[], selected: Set<Card>) {
    return html`${cards.map(x => x.render({selected: selected.has(x)}))}`;
}

function renderPlayed(played: Card[][]) {
    const renderSet = (cards: Card[]) => cards.map(
        card => html`<li>${card.render({selected: false})}</li>`
    );
    return played.map(set => html`<ul>${renderSet(set)}</ul>`);
}


let deck = newDeck();
let table = new Array<Card>();
let played = new Array<Array<Card>>();

shuffle(deck);
deal(deck, 9, table);

let cardsSelected = new Set<Card>();

function gameSelectCard(card: Card): void {
    if (! cardsSelected.has(card)) {
        cardsSelected.add(card);
    } else {
        cardsSelected.delete(card);
    }
    update();
}

function isSet(cards: Set<Card>): boolean {
    // mini function that checks if that an attribute is valid, i.e. all the same, or all different
    function validAttribute(levels: Array<number>){
        if ((levels[0] == levels[1] && levels[1] == levels[2])||(levels[0] != levels[1] && levels[0] != levels[2] && levels[1] != levels[2])){
            return true
        }
        else{
            return false
        }
        

    }
    let shapes : Array<number> = cards[0].shape
    let counts : Array<number> = cards[0].count
    let shades : Array<number> = cards[0].shade
    let colors : Array<number> = cards[0].color
    //checks if all 4 attributes are valid, and if they are, returns true for valid set
    if(validAttribute(shapes) && validAttribute(counts) && validAttribute(shades) && validAttribute(colors)){
        return true;
    }else{
        return false
    }
    
}


function hasValidSet(cards: Array<Card>): boolean {
    // loops through every combination of 3 cards (combination, not permuation, since order doesn't matter)
    //uses a counter in case later we want to implement a number of sets left function
    let validSetCount = 0
    for(let x = 0; x < cards.length - 2; x++){
        for(let y = x + 1; y < cards.length - 1; y++){
            for(let z = y + 1; z < cards.length; z++){
                //creates a set variable with the 3 cards
                let cardsToCheck = new Set<Card>()
                cardsToCheck.add(cards[x])
                cardsToCheck.add(cards[y])
                cardsToCheck.add(cards[z])
                //adds to the counter if the set is valid
                if(isSet(cardsToCheck)){
                    validSetCount ++
                }
            }    
        }
    }
    if(validSetCount > 0){
        return true
    }
    else{
        return false
    }
}

function update() {
    // at this point, all changes to the game state have been made.

    // check if three cards have been selected
    if (cardsSelected.size >= 3) {
        if (isSet(cardsSelected)) {
            played.push([...cardsSelected]);
            table = table.filter(card => ! cardsSelected.has(card));
        }
        // clear the selection
        cardsSelected.clear();
    }

    // check if we have finished
    if (deck.length == 0 && ! hasValidSet(table)) {
        console.log("Victory!");
    }

    // deal new cards if necessary
    while (deck.length >= 3 && (table.length < 9 || ! hasValidSet(table))) {
        deal(deck, 3, table);
    }

    // draw
    render(renderTable(table, cardsSelected), document.getElementById("content")!);
    render(renderPlayed(played), document.getElementById("played")!);
}

update();
