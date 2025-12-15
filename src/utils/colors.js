/**
 * 제조사별 색상 생성 함수 (테스트 상세 정보 모달과 동일한 방식)
 * HSL 색상 공간을 사용하여 골든 앵글 근사값으로 색상 분산
 * @param {number} index - 제조사 인덱스 (0부터 시작)
 * @returns {Object} { gradient: string, solid: string } 색상 객체
 */
export const getManufacturerColor = (index) => {
  const hue = (index * 137.508) % 360 // 골든 앵글 근사값으로 색상 분산
  const color1 = `hsl(${hue}, 70%, 60%)`
  const color2 = `hsl(${(hue + 30) % 360}, 70%, 50%)`
  
  return {
    gradient: `linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`,
    solid: color1
  }
}

/**
 * 제조사 목록을 받아서 색상 매핑을 생성하는 함수
 * 모든 차트에서 동일한 색상과 순서를 보장하기 위해 사용
 * @param {Array<string>} manufacturers - 정렬된 제조사 목록
 * @returns {Map<string, Object>} 제조사별 색상 맵
 */
export const createManufacturerColorMap = (manufacturers) => {
  const map = new Map()
  manufacturers.forEach((mfr, index) => {
    map.set(mfr, getManufacturerColor(index))
  })
  return map
}

