def selection_sort(L):
    for i in range(len(L)-1): #i=items sortedu
        min_index = i #assume first element = lowest element
        for j in range(i+1, len(L)-1): #loop through remaining elements
            if L[j] < L[min_index]: #update min_index
                min_index = j
        L[i], L[min_index] = L[min_index], L[i] #swap with lowest item, first item

L = [3, 1, 41, 59, 26, 53, 59]
print(L)
selection_sort(L)
print(L)
