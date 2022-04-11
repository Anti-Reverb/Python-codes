graph = {
    'A' : ['B','C'],
    'B' : ['D','E'],
    'C' : ['F'],
    'D' : ['G','H'],
    'E' : ['F','I'],
    'F' : ['K'],
    'G' : ['K'],
    'H' : [],
    'I' : [],
    'K' : []
}

visited = set()

def dfs(visited,graph,node):
    if node not in visited:
        print(node)
        visited.add(node)
        for n in graph[node]:
            dfs(visited,graph,n)

dfs(visited,graph,'C')


'''
GRAPH IS ASSUMED AS:
               A
          /         \
         B           C
     /       \           \
    D         E           F
  /   \     /   \        /
 G    H    F     I      K
  \       /
   K     K
'''
