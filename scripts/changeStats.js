const btnShowResult = document.querySelector('.show-result')
const btnShowScore = document.querySelector('.show-score')

btnShowResult.addEventListener('click', (e) => {
    e.preventDefault()
    btnShowResult.classList.add('active')
    btnShowScore.classList.remove('active')
    document.querySelector('.results-table').classList.add('hidden')
    document.querySelector('.stats').classList.remove('hidden')
})

btnShowScore.addEventListener('click', (e) => {
    e.preventDefault()
    btnShowResult.classList.remove('active')
    btnShowScore.classList.add('active')
    document.querySelector('.results-table').classList.remove('hidden')
    document.querySelector('.stats').classList.add('hidden')
})