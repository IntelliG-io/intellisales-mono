import * as React from 'react'

type IconProps = React.SVGProps<SVGSVGElement>

function createMock(name: string) {
  return function MockIcon(props: IconProps) {
    return (
      <svg
        role="img"
        aria-label={name}
        width={20}
        height={20}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect x="2" y="2" width="16" height="16" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }
}

export const Search = createMock('Search')
export const AlertTriangle = createMock('AlertTriangle')
export const FolderOpen = createMock('FolderOpen')

export default { Search, AlertTriangle, FolderOpen }
