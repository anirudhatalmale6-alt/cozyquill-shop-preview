/* ==========================================================================
   The Cozy Quill — Shop behaviour (Stage 1 staging demo)

   In the real build these arrays come out of the database and are edited by
   Claudia in the admin area. They are hardcoded here only so the demo runs as
   a static page with no server behind it.
   ========================================================================== */

/* `vibes` are broad, category-level examples — deliberately NOT the specific tropes
   printed on an individual clue card, so nothing here reads as a promise about the
   book a customer actually receives. Claudia writes these in the admin. */
const GENRES = [
    { id: 'cozy_escape',     emoji: '☕',  name: 'Cozy Escape',     stock: 12, img: 'assets/images/cat_cozy_escape.png',
      vibes: ['Comfort Reads', 'Gentle Chemistry', 'Sunshine Escapes', 'Happy Endings'] },
    { id: 'sports_romance',  emoji: '🏆',  name: 'Sports Romance',  stock: 8,  img: 'assets/images/cat_sports_romance.png',
      vibes: ['Rivalries', 'Teammates', 'Forced Proximity', 'Off-Limits Attraction'] },
    { id: 'bookish_romance', emoji: '📚',  name: 'Bookish Romance', stock: 15, img: 'assets/images/cat_bookish_romance.png',
      vibes: ['Bookshops & Libraries', 'Writers and Readers', 'Literary Love', 'Slow Burn'] },
    { id: 'rom_com',         emoji: '😂',  name: 'Rom-Com',         stock: 6,  img: 'assets/images/cat_rom_com.png',
      vibes: ['Meet-Cutes', 'Banter', 'Fake Dating', 'Opposites Attract'] },
    { id: 'heartwarming',    emoji: '💕',  name: 'Heartwarming',    stock: 9,  img: 'assets/images/cat_heartwarming.png',
      vibes: ['Small Towns', 'Found Family', 'Second Chances', 'Grumpy Meets Sunshine'] },
    { id: 'fantasy_romance', emoji: '🏰',  name: 'Fantasy Romance', stock: 3,  img: 'assets/images/cat_fantasy_romance.png',
      vibes: ['Magic', 'Enemies to Lovers', 'Forbidden Romance', 'High Stakes'] },
    // no badge artwork supplied for Morally Grey yet — its clue card stands in
    { id: 'morally_grey',    emoji: '🖤',  name: 'Morally Grey',    stock: 0,  img: 'assets/images/cat_morally_grey.png',
      vibes: ['Dangerous Attraction', 'Obsession', 'Antiheroes', 'Darker Themes'] }
];

const SPICE = [
    { id: 'sweet',       name: '🌼 Sweet',              desc: 'Romance first, with little to no on-page spice' },
    { id: 'little_heat', name: '🌶️ A Little Heat',      desc: 'Some spice is welcome' },
    { id: 'steamy',      name: '🌶️🌶️ Steamy',           desc: 'Open-door scenes welcome' },
    { id: 'extra_spicy', name: '🌶️🌶️🌶️ Extra Spicy',    desc: 'No need to behave' }
];

const LOW_STOCK_AT = 5;

let selectedGenre = null;
let selectedSpice = null;
let cartCount = 0;

/* ---------- Render the option grids ------------------------------------- */

function renderGenres() {
    const wrap = document.getElementById('genreOpts');
    if (!wrap) return;

    wrap.innerHTML = GENRES.map(g => {
        const soldOut = g.stock === 0;
        const low     = !soldOut && g.stock <= LOW_STOCK_AT;

        let stockLabel = g.stock + ' in stock';
        if (soldOut) stockLabel = 'Sold out';
        else if (low) stockLabel = 'Only ' + g.stock + ' left';

        return `
            <label class="genre_opt ${soldOut ? 'sold_out' : ''}" data-id="${g.id}">
                <input type="radio" name="genre" value="${g.id}" ${soldOut ? 'disabled' : ''}>
                <span class="g_badge"><img src="${g.img}" alt="${g.name}" loading="lazy"></span>
                <span class="g_name">${g.name}</span>
                <span class="g_stock ${low || soldOut ? 'low' : ''}">${stockLabel}</span>
            </label>`;
    }).join('');

    wrap.querySelectorAll('.genre_opt').forEach(el => {
        el.addEventListener('click', e => {
            if (el.classList.contains('sold_out')) {
                e.preventDefault();
                Swal.fire({
                    icon: 'info',
                    title: 'Sold out for now',
                    text: 'This category has run out. The others are still available — and Claudia restocks it from the admin area whenever new copies arrive.',
                    confirmButtonColor: '#6B4F3A'
                });
                return;
            }
            selectedGenre = GENRES.find(g => g.id === el.dataset.id);
            wrap.querySelectorAll('.genre_opt').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            renderVibes();
            updateSummary();
        });
    });
}

function renderSpice() {
    const wrap = document.getElementById('spiceOpts');
    if (!wrap) return;

    wrap.innerHTML = SPICE.map(s => `
        <label class="spice_opt" data-id="${s.id}">
            <input type="radio" name="spice" value="${s.id}">
            <span class="s_name">${s.name}</span>
            <span class="s_desc">${s.desc}</span>
        </label>`).join('');

    wrap.querySelectorAll('.spice_opt').forEach(el => {
        el.addEventListener('click', () => {
            selectedSpice = SPICE.find(s => s.id === el.dataset.id);
            wrap.querySelectorAll('.spice_opt').forEach(o => o.classList.remove('selected'));
            el.classList.add('selected');
            updateSummary();
        });
    });
}

/* ---------- "You might find…" panel -------------------------------------
   Shows broad category vibes once a category is chosen. The wording is
   deliberately non-committal — the book is hand-picked, so nothing here can
   read as a guarantee that a particular trope will appear.                  */

function renderVibes() {
    const box = document.getElementById('genreVibes');
    if (!box) return;

    if (!selectedGenre || !selectedGenre.vibes) {
        box.classList.remove('open');
        box.innerHTML = '';
        return;
    }

    box.innerHTML =
        '<div class="vibes_head">You might find&hellip;</div>' +
        '<div class="vibes_row">' +
        selectedGenre.vibes.map(v => `<span class="vibe">${v}</span>`).join('') +
        '</div>' +
        '<p class="vibes_note">Examples of the kinds of stories in this category. Every book is ' +
        'hand-picked for you, so these are a flavour of what to expect rather than a promise ' +
        'about your particular match.</p>';
    box.classList.add('open');
}

/* ---------- Live matchmaking summary ------------------------------------ */

function setLine(id, value, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    const filled = value && value.trim() !== '';
    el.textContent = filled ? value : fallback;
    el.classList.toggle('empty', !filled);
}

function updateSummary() {
    setLine('sumGenre', selectedGenre ? selectedGenre.emoji + ' ' + selectedGenre.name : '', 'Not chosen yet');
    setLine('sumSpice', selectedSpice ? selectedSpice.name : '', 'Not chosen yet');
    setLine('sumTropes', val('qTropes'), '—');
    setLine('sumAvoid',  val('qAvoid'),  '—');
    setLine('sumOwned',  val('qOwned'),  '—');

    const gift = document.getElementById('giftToggle');
    if (gift && gift.checked) {
        const name = val('giftName');
        setLine('sumGift', name ? 'Yes — for ' + name : 'Yes', 'Yes');
    } else {
        setLine('sumGift', '', 'No');
    }
}

function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

/* ---------- Quantity ----------------------------------------------------- */

function stepQty(delta) {
    const input = document.getElementById('qty');
    if (!input) return;
    let n = parseInt(input.value, 10) + delta;
    if (isNaN(n) || n < 1) n = 1;

    const ceiling = selectedGenre ? selectedGenre.stock : 10;
    if (n > ceiling) {
        n = ceiling;
        Swal.fire({
            icon: 'info',
            title: 'That\'s all we have',
            text: 'Only ' + ceiling + ' left in this category. Stock is tracked per romance category, so the cart can never oversell you.',
            confirmButtonColor: '#6B4F3A'
        });
    }
    input.value = n;
}

/* ---------- Add to cart -------------------------------------------------- */

function initForm() {
    const form = document.getElementById('bdForm');
    if (!form) return;

    ['qTropes', 'qAvoid', 'qOwned', 'qNotes', 'giftName'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSummary);
    });

    const gift = document.getElementById('giftToggle');
    if (gift) {
        gift.addEventListener('change', () => {
            document.getElementById('giftFields').classList.toggle('open', gift.checked);
            updateSummary();
        });
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!selectedGenre) {
            Swal.fire({ icon: 'warning', title: 'Choose your romance', text: 'Please pick a romance category so we know where to start.', confirmButtonColor: '#6B4F3A' });
            document.getElementById('genreOpts').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!selectedSpice) {
            Swal.fire({ icon: 'warning', title: 'How spicy are we feeling?', text: 'Please choose a spice level — it makes a real difference to your match.', confirmButtonColor: '#6B4F3A' });
            document.getElementById('spiceOpts').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const qty = parseInt(document.getElementById('qty').value, 10) || 1;
        cartCount += qty;
        document.querySelectorAll('#cartCount').forEach(el => el.textContent = cartCount);

        const gifted = document.getElementById('giftToggle').checked;

        Swal.fire({
            icon: 'success',
            title: 'Added to your cart',
            html:
                '<div style="text-align:left; font-size:14px; line-height:1.8;">' +
                '<b>' + selectedGenre.emoji + ' ' + selectedGenre.name + '</b> &times; ' + qty + '<br>' +
                'Spice level: ' + selectedSpice.name +
                (gifted ? '<br>Wrapped as a gift 🎁' : '') +
                '<hr style="margin:14px 0; border-color:rgba(107,79,58,.2);">' +
                '<span style="font-size:12.5px; color:#8b7868;">This is the Stage 1 preview, so the cart stops here. ' +
                'The working cart, checkout, flat-rate shipping and Square payment come in Stages 2 and 3 — ' +
                'and every answer above travels with the order to your admin and your email.</span>' +
                '</div>',
            confirmButtonColor: '#6B4F3A',
            confirmButtonText: 'Lovely'
        });
    });
}

/* ---------- Gallery ------------------------------------------------------ */

function initGallery() {
    const thumbs = document.getElementById('galleryThumbs');
    const main   = document.getElementById('galleryMain');
    if (!thumbs || !main) return;

    thumbs.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            main.src = btn.dataset.src;
            thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

/* ---------- Demo-only stubs ---------------------------------------------- */

function cartPreview(e) {
    e.preventDefault();
    Swal.fire({
        icon: 'info',
        title: cartCount ? cartCount + ' item(s) waiting' : 'Your cart is empty',
        text: 'The working cart and checkout are built in Stage 2, with Square payments in Stage 3. This preview covers the shop and product pages only.',
        confirmButtonColor: '#6B4F3A'
    });
}

function newsletterDemo(e) {
    e.preventDefault();
    Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Your existing waitlist form is untouched — this footer is only here so the shop pages match the rest of your site.',
        confirmButtonColor: '#6B4F3A'
    });
    e.target.reset();
    return false;
}

/* ---------- Go ----------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    renderGenres();
    renderSpice();
    initForm();
    initGallery();
    updateSummary();
});
