// ==UserScript==
// @name         Tanrend PowerUp!
// @namespace    http://isti115.github.io/
// @version      0.1
// @description  Használhatóbbá teszi az ELTE tanrendi oldalt.
// @author       Isti115
// @match        http://to.ttk.elte.hu/uj-tanrend*
// @match        https://to.ttk.elte.hu/uj-tanrend*
// @match        http://hallgato.neptun.elte.hu*
// @match        https://hallgato.neptun.elte.hu*
// @grant        none
// ==/UserScript==

(function () {
  'use strict'

  const tanrend = () => {
    console.log('tanrend detected')

    const fixSemesterSelector = () => {
      const getFelev = (today) => {
        const from = today.getFullYear() - 1
        const to = today.getFullYear() + 1

        for (let i = from; i < to; i++) {
          if (today < new Date(`${i}-07-01`)) {
            return `${i - 1}-${i}-2`
          } else if (today < new Date(`${i}-12-20`)) {
            return `${i}-${i + 1}-1`
          }
        }
      }

      const currentYear = (new Date()).getFullYear()

      const options = [...new Array(6)].map(
      (_, i) => [currentYear - 1 + Math.floor(i / 2), i % 2 + 1]
    ).map(
      ([year, semester]) => `${year}-${year + 1}-${semester}`
    ).map(
      semesterString => `<option value="${semesterString}">${semesterString}</option>`
    ).join('\n')

      document.getElementById('felev').innerHTML = options
      document.getElementById('felev').value = getFelev(new Date())
    }

//   document.getElementById('felev').innerHTML = `
// <option value="2017-2018-1">2017-2018-1</option>
// <option value="2017-2018-2">2017-2018-2</option>
// <option value="2018-2019-1">2018-2019-1</option>
// <option value="2018-2019-2">2018-2019-2</option>
// <option value="2019-2020-1">2019-2020-1</option>
// <option value="2019-2020-2">2019-2020-2</option>
// `

    const fixEnterHandling = () => {
      const buttons = [
        document.getElementById('keres'),
        document.getElementById('keres_kod_azon'),
        document.getElementById('keres_okt'),
        document.getElementById('keres_oktnk')
      ]

      const currentCondition =
    () => /Nincs ilyen adat./.test(document.getElementById('ide').innerText)

      const tryNext = (buttons, index, condition) => {
        buttons[index].click()

        setTimeout(() => {
          if (condition() && index + 1 < buttons.length) {
            tryNext(buttons, index + 1, condition)
          }
        }, 1250)
      }

      document.getElementById('mit').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
      // e.stopPropagation()
          e.preventDefault()

          tryNext(buttons, 0, currentCondition)
        }
      })
    }

    const handleHash = () => {
      const hash = window.location.hash.slice(1)

      if (hash.length > 0 && hash.startsWith('TK:')) {
        const courseCode = hash.slice(3)

        document.getElementById('mit').value = courseCode
        document.getElementById('keres_kod_azon').click()
      }
    }

    fixSemesterSelector()
    fixEnterHandling()
    handleHash()
  }

  const neptun = () => {
    console.log('neptun detected')

    const addTanrendLinks = () => {
      const codeColumnHead = document.getElementById('head_Code')

      if (codeColumnHead === null) {
        return
      }

      const codeColumnIndex = [...codeColumnHead.parentElement.children].indexOf(codeColumnHead)

    // const tableBody = document.querySelector('.scrollablebody')
      const tableBody = codeColumnHead.parentElement.parentElement.nextElementSibling
      const tableRows = [...tableBody.children]

      tableRows.forEach(row => {
        const courseCode = row.children[codeColumnIndex].innerText

        const tanrendLink = document.createElement('a')
        tanrendLink.href = `http://to.ttk.elte.hu/uj-tanrend#TK:${courseCode}`
        tanrendLink.target = '_blank'
        tanrendLink.appendChild(document.createTextNode('[T] '))
        tanrendLink.addEventListener('click', e => { e.stopPropagation() }, true)

        const courseCodeCell = row.children[codeColumnIndex]

        courseCodeCell.insertBefore(tanrendLink, courseCodeCell.firstChild)
      })
    }

    const waitForCriteria = (criteria, action, timeout, retryCount) => {
      if (criteria()) {
        action()
      } else if (retryCount > 0) {
        console.log('retrying...')
        setTimeout(
          () => waitForCriteria(criteria, action, timeout, retryCount - 1),
          timeout
        )
      }
    }

    const searchButton = document.getElementById('upFilter_expandedsearchbutton')

    if (searchButton === null) {
      return
    }

    searchButton.addEventListener('click', () => {
      const currentText = document.getElementById('function_table_body').innerText.trim()

      const criteria = () => currentText !== document.getElementById('function_table_body').innerText.trim()

      waitForCriteria(criteria, addTanrendLinks, 1000, 10)
    })
  }

  const sites = [
    {
      pattern: /.*tanrend.*/,
      execute: tanrend
    },
    {
      pattern: /.*neptun.*/,
      execute: neptun
    }
  ]

  sites.forEach(
    site => { if (site.pattern.test(window.location.href)) { site.execute() } }
  )
})()
