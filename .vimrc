syntax on
set ignorecase
set smartcase
set nocompatible
set relativenumber
set nu
set showcmd
set ttyfast
set ruler
set mouse=a
"set paste
set wildmode=longest,list,full
set t_Co=256
set scrolloff=8
"set cursorcolumn
"set cursorline

" syntax highlighting for puppet manifests
autocmd BufNewFile,BufRead *.pp set filetype=ruby

" Install vim-plug if not found
if empty(glob('~/.vim/autoload/plug.vim'))
  silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

" Plugins
call plug#begin()
"Plug 'mhinz/vim-startify'
"Plug 'neoclide/coc.nvim', {'branch': 'release'}
"Plug 'mg979/vim-visual-multi', {'branch': 'master'}
"Plug 'vim-airline/vim-airline'
"Plug 'vim-airline/vim-airline-themes'
"Plug 'preservim/nerdtree'
"Plug 'tomasiser/vim-code-dark'
Plug 'airblade/vim-gitgutter'
Plug 'frazrepo/vim-rainbow'
call plug#end()

""""""""""""""""""""""""""""""""""""""""""
" Plugin config
""""""""""""""""""""""""""""""""""""""""""
" ColorScheme ( airline inherits this also )
"colorscheme codedark

" Airline
"let g:airline#extensions#tabline#enabled = 1
"let g:airline_theme='peaksea'
"let g:airline_theme = 'codedark'

" Rainbow brackets
let g:rainbow_active = 1

"NerdTree
"nmap <C-f> :NERDTreeToggle<CR>
"nnoremap <F3> :NERDTreeToggle<CR>
"autocmd bufenter * if (winnr("$") == 1 && exists("b:NERDTree") && b:NERDTree.isTabTree()) | q | endif
"let g:NERDTreeWinPos = "right"

" COC INSTALL
" curl -sL install-node.now.sh/lts | bash
" :CocInstall coc-python coc-html coc-tsserver coc-json coc-sh coc-phpls coc-solargraph
" pip3 install jedi python-language-server
" Config
""""""""""""""""""""""""""""""""""""""""""
" END of Plugin config
""""""""""""""""""""""""""""""""""""""""""

" Auto Start
"autocmd VimEnter *
"            \   if !argc()
"            \ |   Startify
"            \ |   NERDTree
"            \ |   wincmd w
"            \ | endif

" backspace to multiple lines
set laststatus=1
set backspace=indent,eol,start

" fix splitting
set splitbelow splitright

" paste toggle
set pastetoggle=<F2>

" indent toggle ( when the paste toggle isnt enough )
map <leader>i :setlocal autoindent!<CR>

" mouse toggle
map <F4> <ESC>:exec &mouse!=""? "set mouse=" : "set mouse=a"<CR>

" indent highlight toggle
map <F1> <ESC>:set cursorcolumn!<CR>

" spell check toggle
map <leader>s :setlocal spell! spelllang=en_au<CR>

" line number and git gutter toggle combined ( used for copying code )
map <leader>n :set rnu!<CR>:GitGutterToggle<CR>:set nu!<CR>

" file explorer ( netrw )
nnoremap <F3> :Vexplore<CR>
let g:netrw_liststyle = 3
let g:netrw_banner = 0
let g:netrw_browse_split = 3
let g:netrw_winsize = 10

" indent by 4 spaces
filetype plugin indent on
set tabstop=4
set shiftwidth=4
set expandtab
" end of indent by 4 spaces

" search subdirectories
set path+=**

" Display all matching files when we tab complete
" now we can use :find by partial match with tab complete
" we can also :find *.py to display all python files
set wildmenu

" Remappings
" in normal mode type \ba or \py this will go to the first line and write the shebang
nnoremap <leader>ba ggi#!/usr/bin/env bash<cr><cr>
nnoremap <leader>py ggi#!/usr/bin/env python3<cr><cr>
" nnoremap \html :-1read $HOME/.vim/.skeleton.html<cr>3jwf>a

" replace visually selected lines with whats in register "
vnoremap <leader>p "_dP

" Search mappings: These will make it so that going to the next one in a
" search will center on the line it's found in.
nnoremap n nzzzv
nnoremap N Nzzzv
" this centers once you hit enter on a search but turns of incremental highlighting
" nnoremap / :execute "normal! /\<lt>cr>zz"<c-left><right>

" Center screen on insert
autocmd InsertEnter * norm zz

" Remove trailing whitespaces on save
" autocmd BufWritePre * %s/\s\+$//e

"" no one is really happy until you have this shortcuts
cnoreabbrev W! w!
cnoreabbrev Q! q!
cnoreabbrev Qall! qall!
cnoreabbrev Wq wq
cnoreabbrev Wa wa
cnoreabbrev wQ wq
cnoreabbrev WQ wq
cnoreabbrev W w
cnoreabbrev Q q
cnoreabbrev Qall qall

"" Clean search (highlight)
nnoremap <silent> <leader>c :noh<cr>

"" Switching windows
noremap <C-j> <C-w>j
noremap <C-k> <C-w>k
noremap <C-l> <C-w>l
noremap <C-h> <C-w>h

" switching buffers
nnoremap <S-TAB> :bnext<CR>
nnoremap <leader>bd :bd<CR>

" tabs
nnoremap <leader>tc :tabclose<CR>
nnoremap <leader>1 :tabn1<CR>
nnoremap <leader>2 :tabn2<CR>
nnoremap <leader>3 :tabn3<CR>
nnoremap <leader>4 :tabn4<CR>

" Easy CAPS ( ctrl u to capitalise a word )
inoremap <c-u> <ESC>viwUi
nnoremap <c-u> viwU<ESC>

" run code inside vim
nnoremap <leader>r :w<CR>:term ./%<CR>
nnoremap <leader>q :q<CR>

" Vmap for maintain Visual Mode after shifting > and <
vmap < <gv
vmap > >gv

" find and replace
nnoremap <leader>r :%s///gI<left><left><left><left>

""""""""""""""""""""""""""""""""""""""""""
" Styling
""""""""""""""""""""""""""""""""""""""""""
set incsearch " highlight whilst typing ( incremental search )
highlight IncSearch guibg=black guifg=red ctermbg=black ctermfg=red term=underline
set hlsearch " highlight found text
highlight Search ctermfg=black ctermbg=red
set showmatch " highlight brackets
hi MatchParen cterm=bold ctermbg=black ctermfg=red

" line numbers styling
highlight LineNr ctermfg=DarkGrey

" Vertical split styling
set fillchars+=vert:\
highlight VertSplit ctermfg=235 ctermbg=235

" Menu styling
highlight Pmenu ctermbg=235
""""""""""""""""""""""""""""""""""""""""""
" Styling
""""""""""""""""""""""""""""""""""""""""""

