const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const listEl = document.getElementById('list');
const form = document.getElementById('form');
const descEl = document.getElementById('desc');
const amountEl = document.getElementById('amount');

let transactions = [];

function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
    updateUI();
}

function updateUI() {
    listEl.innerHTML = '';
    
    let income = 0;
    let expense = 0;
    let balance = 0;

    transactions.forEach((transaction, index) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
            income += amount;
        } else {
            expense += amount;
        }

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-text">${transaction.desc}</span>
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}$${amount.toFixed(2)}
                </span>
            </div>
            <button class="delete-btn" onclick="deleteTransaction(${index})">×</button>
        `;
        listEl.appendChild(li);
    });

    balance = income - expense;
    balanceEl.textContent = `$${balance.toFixed(2)}`;
    incomeEl.textContent = `$${income.toFixed(2)}`;
    expenseEl.textContent = `$${expense.toFixed(2)}`;

    if (balance >= 0) {
        balanceEl.style.color = '#10b981';
    } else {
        balanceEl.style.color = '#ef4444';
    }
}

function addTransaction(e) {
    e.preventDefault();
    
    const desc = descEl.value.trim();
    const amount = parseFloat(amountEl.value);
    const type = document.querySelector('input[name="type"]:checked').value;

    if (!desc || isNaN(amount) || amount <= 0) {
        return;
    }

    transactions.push({ desc, amount, type });
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    descEl.value = '';
    amountEl.value = '';
    
    updateUI();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateUI();
}

form.addEventListener('submit', addTransaction);

loadTransactions();