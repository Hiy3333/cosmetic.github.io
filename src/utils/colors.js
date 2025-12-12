// 제조사별 색상 생성 유틸리티

// HSL 색상 공간을 사용하여 제조사별로 고유한 색상 생성
// Golden angle approximation을 사용하여 색상 분산 최적화
export const createManufacturerColorMap = (manufacturers) => {
  const colorMap = {}
  const goldenAngle = 137.508 // Golden angle in degrees
  
  manufacturers.forEach((manufacturer, index) => {
    // Hue: Golden angle을 사용하여 균등하게 분산
    const hue = (index * goldenAngle) % 360
    // Saturation: 60-80% 사이 (너무 진하지 않게)
    const saturation = 60 + (index % 3) * 5 // 60, 65, 70
    // Lightness: 45-55% 사이 (가독성 유지)
    const lightness = 50 + (index % 2) * 3 // 50, 53
    
    colorMap[manufacturer] = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  })
  
  return colorMap
}

