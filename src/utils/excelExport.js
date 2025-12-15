import * as XLSX from 'xlsx'
import { getTestData } from './storage'

// 테스트 항목을 카테고리별로 매핑
const testItemCategories = {
  '외관&물성': [
    { name: '점도(육안)', key: '점도(육안)' },
    { name: '제형 안정성', key: '제형 안정성' }
  ],
  '사용감': [
    { name: '롤링감(뭉침)', key: '롤링감(뭉침)' },
    { name: '흡수 속도', key: '흡수 속도' },
    { name: '흡수 후 잔감', key: '흡수 후 잔감' },
    { name: '재도포', key: '재도포' },
    { name: '후속화장품 흡수', key: '후속화장품 흡수' },
    { name: '수분감(속)', key: '수분감(속)' },
    { name: '수분감(겉)', key: '수분감(겉)' },
    { name: '피부결 개선', key: '피부결 개선' },
    { name: '진정감', key: '진정감' },
    { name: '보습 지속력', key: '보습 지속력' },
    { name: '피막감', key: '피막감' },
    { name: '끈적임', key: '끈적임' }
  ],
  '안정성': [
    { name: '따가움', key: '따가움' },
    { name: '가려움', key: '가려움' },
    { name: '홍반', key: '홍반' },
    { name: '열감', key: '열감' },
    { name: '트러블', key: '트러블' }
  ],
  '기타': [
    { name: '타깃 제품과 제형 유사성', key: '타깃 제품과 제형 유사성' }
  ]
}

// 제조사별 시트 생성 함수
const createSheetForManufacturer = (wb, manufacturer, tests) => {
  // 해당 제조사의 테스트만 필터링
  const filteredTests = tests.filter(test => test.manufacturer === manufacturer)

  if (filteredTests.length === 0) {
    return // 데이터가 없으면 시트 생성하지 않음
  }

  // 작성자별로 그룹화
  const testsByAuthor = {}
  filteredTests.forEach(test => {
    const author = test.author || '기타'
    if (!testsByAuthor[author]) {
      testsByAuthor[author] = []
    }
    testsByAuthor[author].push(test)
  })

  // 작성자 목록 정렬
  const sortedAuthors = Object.keys(testsByAuthor).sort()

  // 각 작성자의 테스트를 날짜, 샘플, 피부타입, 회차 순으로 정렬
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.sort((a, b) => {
      // 날짜 순
      const dateA = new Date(a.date || 0)
      const dateB = new Date(b.date || 0)
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime()
      }
      // 샘플 넘버 순
      const sampleA = parseInt(a.sampleNumber) || 0
      const sampleB = parseInt(b.sampleNumber) || 0
      if (sampleA !== sampleB) {
        return sampleA - sampleB
      }
      // 피부타입 순
      const skinA = (a.skinType || '').localeCompare(b.skinType || '')
      if (skinA !== 0) {
        return skinA
      }
      // 회차 순
      const usageA = parseInt(a.usageCount) || 0
      const usageB = parseInt(b.usageCount) || 0
      return usageA - usageB
    })
  })

  // 데이터 배열 생성
  const data = []

  // 첫 번째 행: 제목
  const titleRow = []
  titleRow[0] = '솔틴(SATINE) 샘플 테스트'
  data.push(titleRow)
  
  // 빈 행
  data.push([])
  
  // 기본 정보 행
  const infoRow1 = []
  infoRow1[0] = 'OEM 제조사 명'
  infoRow1[1] = manufacturer || ''
  data.push(infoRow1)

  // 빈 행
  data.push([])

  // 헤더 구조: 날짜, 시간대, 작성자, 샘플, 피부타입, 회차
  // 첫 번째 헤더 행: 분류 | 테스트 항목 | 날짜 (각 회차마다) | ...
  const headerRow1 = ['분류', '테스트 항목']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const dateStr = test.date ? new Date(test.date).toISOString().split('T')[0] : ''
      headerRow1.push(dateStr)
    })
  })
  data.push(headerRow1)

  // 두 번째 헤더 행: 빈칸 | 빈칸 | 시간대 (각 회차마다) | ...
  const headerRow2 = ['', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const timeStr = test.timeSlot || ''
      headerRow2.push(timeStr)
    })
  })
  data.push(headerRow2)

  // 세 번째 헤더 행: 빈칸 | 빈칸 | 작성자 (각 회차마다) | ...
  const headerRow3 = ['', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(() => {
      headerRow3.push(author)
    })
  })
  data.push(headerRow3)

  // 네 번째 헤더 행: 빈칸 | 빈칸 | 샘플 (각 회차마다) | ...
  const headerRow4 = ['', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const sampleLabel = test.sampleNumber ? `샘플 ${test.sampleNumber}` : '샘플 미지정'
      headerRow4.push(sampleLabel)
    })
  })
  data.push(headerRow4)

  // 다섯 번째 헤더 행: 빈칸 | 빈칸 | 피부타입 (각 회차마다) | ...
  const headerRow5 = ['', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const skinType = test.skinType || ''
      headerRow5.push(skinType)
    })
  })
  data.push(headerRow5)

  // 여섯 번째 헤더 행: 빈칸 | 빈칸 | 회차 (각 회차마다) | ...
  const headerRow6 = ['', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const usage = test.usageCount ? `${test.usageCount}회차` : ''
      headerRow6.push(usage)
    })
  })
  data.push(headerRow6)

  // 테스트 항목별 데이터
  Object.entries(testItemCategories).forEach(([category, items]) => {
    items.forEach((item, index) => {
      const row = []
      if (index === 0) {
        // 첫 번째 항목에만 카테고리 표시
        row[0] = category
      } else {
        row[0] = '' // 병합을 위한 빈 셀
      }
      row[1] = item.name
      
      // 각 작성자별, 회차별 점수 입력
      sortedAuthors.forEach(author => {
        const authorTests = testsByAuthor[author]
        authorTests.forEach(test => {
          const scores = test.scores || {}
          if (item.key && scores[item.key] !== undefined) {
            row.push(scores[item.key])
          } else {
            row.push('')
          }
        })
      })
      
      data.push(row)
    })
  })

  // 빈 행
  data.push([])

  // 총점 행
  const totalRow = ['총점', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const total = test.totalScore || 0
      totalRow.push(total)
    })
  })
  data.push(totalRow)

  // 평균 점수 행
  const avgRow = ['평균 점수', '']
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(test => {
      const avg = parseFloat(test.averageScore || 0).toFixed(2)
      avgRow.push(avg)
    })
  })
  data.push(avgRow)

  // 빈 행
  data.push([])

  // 개선사항
  const hasImprovements = sortedAuthors.some(author => 
    testsByAuthor[author].some(test => test.improvement && test.improvement.trim())
  )
  
  if (hasImprovements) {
    const improvementHeaderRow = ['개선사항(향,색상 추가)', '']
    sortedAuthors.forEach(author => {
      const authorTests = testsByAuthor[author]
      authorTests.forEach(() => {
        improvementHeaderRow.push('')
      })
    })
    data.push(improvementHeaderRow)

    // 개선사항을 한 행에 회차별로 배치
    const improvementRow = ['', '']
    sortedAuthors.forEach(author => {
      const authorTests = testsByAuthor[author]
      authorTests.forEach(test => {
        improvementRow.push(test.improvement || '')
      })
    })
    data.push(improvementRow)
  }

  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet(data)

  // 총 컬럼 수 계산
  let totalCols = 2 // 분류, 테스트 항목
  sortedAuthors.forEach(author => {
    totalCols += testsByAuthor[author].length
  })

  // 컬럼 너비 설정
  const colWidths = [
    { wch: 18 }, // 분류
    { wch: 25 }  // 테스트 항목
  ]
  // 작성자별 회차 컬럼 너비 추가
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    authorTests.forEach(() => {
      colWidths.push({ wch: 12 })
    })
  })
  ws['!cols'] = colWidths

  // 병합 설정
  if (!ws['!merges']) ws['!merges'] = []
  
  // 제목 병합 (첫 번째 행 전체)
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } })
  
  // 헤더 병합: 각 작성자의 회차들을 세로로 병합
  // 행 번호: 0=제목, 1=빈행, 2=기본정보, 3=빈행, 4=날짜, 5=시간대, 6=작성자, 7=샘플, 8=피부타입, 9=회차, 10=첫번째데이터
  let headerCol = 2 // 분류, 테스트 항목 다음부터
  sortedAuthors.forEach(author => {
    const authorTests = testsByAuthor[author]
    if (authorTests.length > 1) {
      // 날짜 행 병합: 같은 날짜끼리만 병합
      let dateStartCol = headerCol
      let currentDate = authorTests[0].date ? new Date(authorTests[0].date).toISOString().split('T')[0] : ''
      
      for (let i = 1; i < authorTests.length; i++) {
        const testDate = authorTests[i].date ? new Date(authorTests[i].date).toISOString().split('T')[0] : ''
        if (testDate !== currentDate) {
          // 날짜가 바뀌면 이전 날짜 범위 병합
          const dateEndCol = headerCol + i - 1
          if (dateEndCol > dateStartCol) {
            ws['!merges'].push({ 
              s: { r: 4, c: dateStartCol }, 
              e: { r: 4, c: dateEndCol } 
            })
          }
          dateStartCol = headerCol + i
          currentDate = testDate
        }
      }
      // 마지막 날짜 범위 병합
      const dateEndCol = headerCol + authorTests.length - 1
      if (dateEndCol > dateStartCol) {
        ws['!merges'].push({ 
          s: { r: 4, c: dateStartCol }, 
          e: { r: 4, c: dateEndCol } 
        })
      }

      // 시간대 행 병합: 같은 날짜와 시간대끼리만 병합
      let timeStartCol = headerCol
      let currentDateTime = authorTests[0].date ? new Date(authorTests[0].date).toISOString().split('T')[0] : ''
      currentDateTime += (authorTests[0].timeSlot || '')
      
      for (let i = 1; i < authorTests.length; i++) {
        const testDate = authorTests[i].date ? new Date(authorTests[i].date).toISOString().split('T')[0] : ''
        const testDateTime = testDate + (authorTests[i].timeSlot || '')
        if (testDateTime !== currentDateTime) {
          const timeEndCol = headerCol + i - 1
          if (timeEndCol > timeStartCol) {
            ws['!merges'].push({ 
              s: { r: 5, c: timeStartCol }, 
              e: { r: 5, c: timeEndCol } 
            })
          }
          timeStartCol = headerCol + i
          currentDateTime = testDateTime
        }
      }
      // 마지막 시간대 범위 병합
      const timeEndCol = headerCol + authorTests.length - 1
      if (timeEndCol > timeStartCol) {
        ws['!merges'].push({ 
          s: { r: 5, c: timeStartCol }, 
          e: { r: 5, c: timeEndCol } 
        })
      }

      // 작성자 행 병합 (행 6)
      ws['!merges'].push({ 
        s: { r: 6, c: headerCol }, 
        e: { r: 6, c: headerCol + authorTests.length - 1 } 
      })

      // 샘플 행 병합: 같은 샘플끼리만 병합
      let sampleStartCol = headerCol
      let currentSample = authorTests[0].sampleNumber || ''
      
      for (let i = 1; i < authorTests.length; i++) {
        const testSample = authorTests[i].sampleNumber || ''
        if (testSample !== currentSample) {
          const sampleEndCol = headerCol + i - 1
          if (sampleEndCol > sampleStartCol) {
            ws['!merges'].push({ 
              s: { r: 7, c: sampleStartCol }, 
              e: { r: 7, c: sampleEndCol } 
            })
          }
          sampleStartCol = headerCol + i
          currentSample = testSample
        }
      }
      // 마지막 샘플 범위 병합
      const sampleEndCol = headerCol + authorTests.length - 1
      if (sampleEndCol > sampleStartCol) {
        ws['!merges'].push({ 
          s: { r: 7, c: sampleStartCol }, 
          e: { r: 7, c: sampleEndCol } 
        })
      }

      // 피부타입 행 병합: 같은 피부타입끼리만 병합
      let skinStartCol = headerCol
      let currentSkin = authorTests[0].skinType || ''
      
      for (let i = 1; i < authorTests.length; i++) {
        const testSkin = authorTests[i].skinType || ''
        if (testSkin !== currentSkin) {
          const skinEndCol = headerCol + i - 1
          if (skinEndCol > skinStartCol) {
            ws['!merges'].push({ 
              s: { r: 8, c: skinStartCol }, 
              e: { r: 8, c: skinEndCol } 
            })
          }
          skinStartCol = headerCol + i
          currentSkin = testSkin
        }
      }
      // 마지막 피부타입 범위 병합
      const skinEndCol = headerCol + authorTests.length - 1
      if (skinEndCol > skinStartCol) {
        ws['!merges'].push({ 
          s: { r: 8, c: skinStartCol }, 
          e: { r: 8, c: skinEndCol } 
        })
      }
    }
    headerCol += authorTests.length
  })
  
  // 카테고리 병합 (각 카테고리의 첫 번째 행부터 마지막 행까지)
  // 행 번호: 0=제목, 1=빈행, 2=기본정보, 3=빈행, 4=날짜, 5=시간대, 6=작성자, 7=샘플, 8=피부타입, 9=회차, 10=첫번째데이터
  let currentRow = 10 // 테이블 헤더 다음 행부터 시작 (0-based index, 헤더가 6줄이므로 10부터)
  Object.entries(testItemCategories).forEach(([category, items]) => {
    if (items.length > 1) {
      ws['!merges'].push({ 
        s: { r: currentRow, c: 0 }, 
        e: { r: currentRow + items.length - 1, c: 0 } 
      })
    }
    currentRow += items.length
  })

  // 시트 이름 생성 (제조사 이름만, 최대 31자)
  const sheetName = manufacturer.substring(0, 31)

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
}

// 엑셀 파일 생성 및 다운로드
export const exportToExcel = async (formData, filterOptions = null) => {
  try {
    // 워크북 생성
    const wb = XLSX.utils.book_new()

    // 모든 테스트 데이터 가져오기 (async 함수이므로 await 필요)
    let allTestData = await getTestData()

    // 데이터가 없으면 경고
    if (!allTestData || allTestData.length === 0) {
      alert('다운로드할 테스트 데이터가 없습니다.')
      return
    }

    // 필터 옵션이 있으면 필터링
    if (filterOptions) {
      const { manufacturer, author, date } = filterOptions
      allTestData = allTestData.filter(test => {
        // undefined나 null이 아니고 빈 문자열도 아닐 때만 필터링
        if (manufacturer !== undefined && manufacturer !== null && manufacturer !== '' && test.manufacturer !== manufacturer) return false
        if (author !== undefined && author !== null && author !== '' && test.author !== author) return false
        if (date !== undefined && date !== null && date !== '' && test.date !== date) return false
        return true
      })
      
      // 필터링 후 데이터가 없으면 경고
      if (allTestData.length === 0) {
        alert('필터 조건에 맞는 테스트 데이터가 없습니다.')
        return
      }
    }

    // 제조사 목록 추출
    const manufacturers = new Set()
    allTestData.forEach(test => {
      if (test.manufacturer) {
        manufacturers.add(test.manufacturer)
      }
    })

    // 제조사별로 정렬
    const sortedManufacturers = Array.from(manufacturers).sort()

    // 각 제조사별로 시트 생성
    sortedManufacturers.forEach(manufacturer => {
      createSheetForManufacturer(wb, manufacturer, allTestData)
    })

    // 시트가 하나도 없으면 경고
    if (sortedManufacturers.length === 0) {
      alert('다운로드할 데이터가 없습니다.')
      return
    }

    // 파일명 생성
    let fileName = `솔틴_샘플테스트_${new Date().toISOString().split('T')[0]}.xlsx`
    if (filterOptions && filterOptions.date) {
      fileName = `솔틴_샘플테스트_${filterOptions.date}.xlsx`
    } else if (filterOptions && (filterOptions.manufacturer || filterOptions.author)) {
      const parts = []
      if (filterOptions.manufacturer) parts.push(filterOptions.manufacturer)
      if (filterOptions.author) parts.push(filterOptions.author)
      fileName = `솔틴_샘플테스트_${parts.join('_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    }

    // 파일 다운로드
    XLSX.writeFile(wb, fileName)
    console.log('엑셀 파일 다운로드 완료:', fileName)
  } catch (error) {
    console.error('엑셀 다운로드 실패:', error)
    alert('엑셀 파일 다운로드 중 오류가 발생했습니다: ' + error.message)
  }
}
