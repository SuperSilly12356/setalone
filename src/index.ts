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
        return html`
            <button
                style="color: ${colorAttr};"
                class="${selectedClass}"
                @click=${() => gameSelectCard(this)}
            >
                ${[...Array(this.count).keys()].map(_ => shapeShade)}
            </button>
        `;
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
    for (let i = 0; i < xs.length - 2; i++) {
        const j = i + Math.floor(Math.random() * (xs.length - i));
        const temp = xs[i];
        xs[i] = xs[j];
        xs[j] = temp;
    }
}

function deal<T>(src: T[], count: Number, dest: T[]) {
    for (let i = 0; i < count; i++) {
        dest.push(src.pop()!);
    }
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
    return true;
}

function hasValidSet(cards: Array<Card>): boolean {
    return true;
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
