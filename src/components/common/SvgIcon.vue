<template>
  <svg
    v-if="name === 'logo-plain'"
    width="300"
    height="300"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="path-1-inside-1" fill="white">
      <rect width="300" height="300" rx="4" />
    </mask>
    <rect
      width="300"
      height="300"
      rx="4"
      stroke="black"
      stroke-width="30"
      mask="url(#path-1-inside-1)"
    />
    <path
      d="M184.976 171.28C184.976 177.04 183.512 182.152 180.584 186.616C177.704 191.032 173.504 194.512 167.984 197.056C162.512 199.552 155.864 200.8 148.04 200.8C140.456 200.8 133.688 199.648 127.736 197.344C121.784 195.04 116.72 191.872 112.544 187.84L120.68 178.696C124.136 181.912 128.096 184.456 132.56 186.328C137.024 188.2 142.232 189.136 148.184 189.136C152.072 189.136 155.672 188.512 158.984 187.264C162.344 185.968 165.032 184.048 167.048 181.504C169.112 178.912 170.144 175.672 170.144 171.784C170.144 168.712 169.52 166.096 168.272 163.936C167.072 161.728 164.936 159.784 161.864 158.104C158.792 156.424 154.496 154.768 148.976 153.136C138.896 150.16 131.048 146.536 125.432 142.264C119.816 137.992 117.008 131.92 117.008 124.048C117.008 118.912 118.424 114.4 121.256 110.512C124.088 106.576 127.976 103.504 132.92 101.296C137.864 99.088 143.552 97.984 149.984 97.984C156.944 97.984 163.016 98.992 168.2 101.008C173.432 103.024 178.136 105.88 182.312 109.576L174.392 118.504C170.84 115.384 167.024 113.128 162.944 111.736C158.912 110.296 154.808 109.576 150.632 109.576C145.352 109.576 140.864 110.728 137.168 113.032C133.472 115.288 131.624 118.744 131.624 123.4C131.624 126.184 132.368 128.56 133.856 130.528C135.344 132.448 137.84 134.224 141.344 135.856C144.896 137.488 149.744 139.216 155.888 141.04C161.216 142.624 166.064 144.568 170.432 146.872C174.848 149.128 178.376 152.2 181.016 156.088C183.656 159.928 184.976 164.992 184.976 171.28Z"
      fill="black"
    />
  </svg>
  <svg
    v-else-if="name === 'colored-logo'"
    width="300"
    height="300"
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id="path-1-inside-1" fill="white">
      <rect width="300" height="300" rx="4" />
    </mask>
    <rect
      width="300"
      height="300"
      rx="4"
      stroke="#64FFDA"
      stroke-width="30"
      mask="url(#path-1-inside-1)"
    />
    <path
      d="M184.976 171.28C184.976 177.04 183.512 182.152 180.584 186.616C177.704 191.032 173.504 194.512 167.984 197.056C162.512 199.552 155.864 200.8 148.04 200.8C140.456 200.8 133.688 199.648 127.736 197.344C121.784 195.04 116.72 191.872 112.544 187.84L120.68 178.696C124.136 181.912 128.096 184.456 132.56 186.328C137.024 188.2 142.232 189.136 148.184 189.136C152.072 189.136 155.672 188.512 158.984 187.264C162.344 185.968 165.032 184.048 167.048 181.504C169.112 178.912 170.144 175.672 170.144 171.784C170.144 168.712 169.52 166.096 168.272 163.936C167.072 161.728 164.936 159.784 161.864 158.104C158.792 156.424 154.496 154.768 148.976 153.136C138.896 150.16 131.048 146.536 125.432 142.264C119.816 137.992 117.008 131.92 117.008 124.048C117.008 118.912 118.424 114.4 121.256 110.512C124.088 106.576 127.976 103.504 132.92 101.296C137.864 99.088 143.552 97.984 149.984 97.984C156.944 97.984 163.016 98.992 168.2 101.008C173.432 103.024 178.136 105.88 182.312 109.576L174.392 118.504C170.84 115.384 167.024 113.128 162.944 111.736C158.912 110.296 154.808 109.576 150.632 109.576C145.352 109.576 140.864 110.728 137.168 113.032C133.472 115.288 131.624 118.744 131.624 123.4C131.624 126.184 132.368 128.56 133.856 130.528C135.344 132.448 137.84 134.224 141.344 135.856C144.896 137.488 149.744 139.216 155.888 141.04C161.216 142.624 166.064 144.568 170.432 146.872C174.848 149.128 178.376 152.2 181.016 156.088C183.656 159.928 184.976 164.992 184.976 171.28Z"
      fill="#64FFDA"
    />
  </svg>
  <svg
    v-else-if="name === 'github'"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-github"
  >
    <title>GitHub</title>
    <path
      d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
    ></path>
  </svg>
  <svg
    v-else-if="name === 'insta'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-instagram"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
  </svg>
  <svg
    v-else-if="name === 'linkedin'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-linkedin"
  >
    <path
      d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
    />
    <circle cx="4" cy="4" r="2" />
  </svg>
  <svg
    v-else-if="name === 'twitter'"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-twitter"
  >
    <path
      d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
    />
  </svg>
  <svg
    v-else-if="name === 'medium'"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    fill-rule="evenodd"
    clip-rule="evenodd"
  >
    <path
      d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z"
    />
  </svg>
  <svg
    v-else-if="name === 'linkto'"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-external-link"
  >
    <title>External Link</title>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
  <svg
    v-else-if="name === 'folder'"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="feather feather-folder"
  >
    <title>Folder</title>
    <path
      d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
    />
  </svg>
</template>

<script>
export default {
  name: "SvgIcon",
  props: {
    name: String
  }
};
</script>

<style scoped></style>
