module Lecture4Full where

import Prelude hiding ((++), reverse)

{-------------------------------------------------------------------------------

Part 0: The problem with reverse
================================

Let's start with writing the reverse function.

-------------------------------------------------------------------------------}

reverse :: [a] -> [a]

reverse [] = []

-- At this point, you may be tempted to start considering more base cases;
-- equations like:

reverse [x] = [x]
reverse [x, y] = [y, x]
reverse [x, y, z] = [z, y, x]

{-------------------------------------------------------------------------------

This is probably driven by two things.  One is a preference for the concrete:
these equations each deal with a fixed list structure.  The second is a mistaken
belief, fostered by courses in discrete mathematics, that inductive proofs can
somehow be seen by "looking for patterns".  But here, it is not at all evident
what pattern we should be observing: the last element becomes the first?  The
first becomes the last?  Something about the middle?

More productively, we can start from the definition of lists themselves:

    reverse (x : xs) = ...

Next, we have to rely on the recursive definition:

    reverse (x : xs) = ... reverse xs ...

The key idea is that we rely on `reverse` to do "the right thing" for the
substructure `xs`.  Now, assuming that we've arrived at a reversed copy of `xs`,
how can we use that to generate a reversed `x : xs`? 

-------------------------------------------------------------------------------}

reverse (x : xs) = reverse xs ++ [x]

{-------------------------------------------------------------------------------

What's wrong with this?  Complexity.  Let's consider what happens when we
attempt to reverse a list:

    reverse [5, 4, 3, 2, 1]       -- remember, this is 5 : (4 : (3 : ...))
  =
    reverse [4, 3, 2, 1] ++ [5]
  =
    (reverse [3, 2, 1] ++ [4]) ++ [5]
  =
    ((reverse [2, 1] ++ [3]) ++ [4]) ++ [5]
  =
    (((reverse [1] ++ [2]) ++ [3]) ++ [4]) ++ [5]
  =
    ((((reverse [] ++ [1]) ++ [2]) ++ [3]) ++ [4]) ++ [5]
  =
    (((([] ++ [1]) ++ [2]) ++ [3]) ++ [4]) ++ [5]

What's the problem here?  Let's consider the definition of append:

-------------------------------------------------------------------------------}

(++) :: [a] -> [a] -> [a]

-- We have two possibilities for recursion: we can either attempt to recur on
-- the left-hand or right-hand argument.  Let's start by considering the base
-- cases.

[] ++ [] = []
xs ++ [] = xs
[] ++ ys = ys

{-------------------------------------------------------------------------------

These don't point in any particular direction.  So let's try recursion on the
second argument:

    xs ++ (y : ys) = ... xs ++ ys ...

Now we need some way to insert `y` in the right place within `xs ++ ys`... but
we do not have an obvious way to do this.  Let's try the other way

-------------------------------------------------------------------------------}

(x : xs) ++ ys = x : xs ++ ys

{-------------------------------------------------------------------------------

Here it's quite natural where to put `x`.

How much time does it take to append lists?  We have to step through the first
list, so if we say that `xs` has size `m` and `ys` has size `n`, then append
takes `O(m)` time.

Returning to `reverse`: how long does it take to reverse a list of length n?
Unfortunately, it's:

   n-1  +  n-2  +  n-3  +  n-4  +  ...  +  1  =  n^2

-------------------------------------------------------------------------------}


{-------------------------------------------------------------------------------

Part 1: Append-lists and their reversal
=======================================

Let's try to do better.  We'll define a new representation of lists, for which
appending will be easy.

-------------------------------------------------------------------------------}

data Appl a = One a | Appl a :+: Appl a
  deriving Show

{-------------------------------------------------------------------------------

The name stands for "append-lists", although you might also think of these as a
kind of tree.  Here are some examples, with the lists they correspond to:

    One 'a' :+: (One 'b' :+: One 'c')        -- ['a', 'b', 'c']
    (One 1 :+: One 2) :+: (One 3 :+: One 4)  -- [1, 2, 3, 4]
    One 1 :+: ((One 2 :+: One 3) :+: One 4)  -- also [1, 2, 3, 4]

You might notice at ths point that we don't have a way to represent empty lists.
For reasons that will become apparent later, I'm splitting this into a separate
data type.

-------------------------------------------------------------------------------}

data AL a = Empty | Full (Appl a)

{-------------------------------------------------------------------------------

Our goal is to reverse things, so let's think about how to reverse `Appl`s.
Again, we can follow the definitions of the types; the bodies of the defintions
are "so obvious" that I'm not going to include their derivation here.

-------------------------------------------------------------------------------}

revAL :: AL a -> AL a
revAL Empty = Empty
revAL (Full as) = Full (revAppl as)

revAppl :: Appl a -> Appl a
revAppl (One a) = One a
revAppl (as :+: bs) = revAppl bs :+: revAppl as

{-------------------------------------------------------------------------------

Suppose we have an Appl containing n (>= 1) elements.  How long does it take to
reverse?

 - We need to have n `One` constructors, each of which is processed in constant
   time.  So that's O(n) work.

 - In the *worst* case, we have n `:+:` constructors, each of which is processed
   in constant (additional) time.  So that's O(n) work.

Putting it together, we get reverse in O(n) time.  As our output is of size
O(n), this is the best we can do.

-------------------------------------------------------------------------------}

{-------------------------------------------------------------------------------

Part 2: Append-lists and cons-lists
===================================

While append-lists are structured differently from cons-lists, we are using both
to represent sequences of values.  We might hope for the types to be in
*isomorphisms*---that is to say, every cons-list uniquely corresponds to an
append-list, and vice-versa.  We can define translation functions between the
two types:

-------------------------------------------------------------------------------}

fromList :: [a] -> AL a
fromList []  = Empty
fromList xs  = Full (fromList' xs)

fromList' :: [a] -> Appl a
fromList' [x] = One x
fromList' (x : xs) = One x :+: fromList' xs

-- Note that fromList' prime includes one undefined case: fromList' [] will
-- generate an exception.  Because fromList' is called from fromList, we can be
-- confident this invariant is respected... alternatively, we can capture it in
-- the definition of fromList':

fromList'' x [] = One x
fromList'' x (y : ys) = One x :+: fromList'' y ys

toList0 :: AL a -> [a]
toList0 Empty      = []
toList0 (Full as) = toList0' as

toList0' (One x)   = [x]
toList0' (a :+: b) = toList0' a ++ toList0' b

{-------------------------------------------------------------------------------

And now we can discover our new definition of reverse:

-------------------------------------------------------------------------------}

reverse0 = toList0 . revAL . fromList

{-------------------------------------------------------------------------------

Is this better than our previous version?  We might hope so: `revAL` now takes
O(n) time in the size of the input list.  Unfortunately, the problem returns in
toList0.  Let's imagine an execution to make this clear:

      reverse0 [1,2,3,4]
    =
      (toList0 . revAL . fromList) [1,2,3,4]
    =
      (toList0 . revAL) (Full (One 1 :+: (One 2 :+: (One 3 :+: One 4))))
    =
      toList0 (Full ((One 4 :+: One 3) :+: One 2) :+: One 1)
    =
      (([4] ++ [3]) ++ [2]) ++ [1]

And we're back where we started: lots of appends, nested the wrong way.  But
maybe this is progress: by making appends *explicit* in our representation of
lists, perhaps we can rely on the associativity of append.

-------------------------------------------------------------------------------}

groupRight :: AL a -> AL a
groupRight Empty = Empty
groupRight (Full as) = Full (groupRight' as)

groupRight' :: Appl a -> Appl a
groupRight' (One a) = One a
groupRight' (One a :+: bs) = One a :+: groupRight' bs
groupRight' ((as :+: as') :+: bs) = groupRight' (as :+: (as' :+: bs))

toList1 :: AL a -> [a]
toList1 = toList0 . groupRight

{-------------------------------------------------------------------------------

We can try to convince ourselves that `assocRight` itself only takes linear
time.  Again, a fully left-associated `Appl a` is the worst-case scenario, and
we should see that, while `assocRight` will visit each `:+:` node twice (once on
the way up and once on the way down) that still leaves linear complexity over
all.

On the other hand, going via `assocRight` is a bit awkward: we create a copy of
the original `Appl`, just to immediately destruct it in `toList0`.  We might
hope to combine these operations to avoid the intermediate data structure (and
associated allocation time and memory costs).

-------------------------------------------------------------------------------}

toList2 :: AL a -> [a]
toList2 Empty = []
toList2 (Full as) = go as where
    go (One x)            = [x]
    go (One x :+: a)      = x : go a
    go ((a :+: a') :+: b) = go a ++ go (a' :+: b)

{-------------------------------------------------------------------------------

There is still, annoyingly, a use of `++`.  However, if we look at all of the
individual lists we create---in the One cases---we might notice that they're
singleton lists.  This gives us the second key idea of these lectures: rather
than treating `go` and `++` separately, we'll merge them into a single operation
which does *both* the `go` and the subsequent `++`.

This means that our new `go` function takes two arguments: the first is a tree,
and the second is a list.  Think of the new `go a xs` as being equivalent to the
previous `go a ++ xs`.

Of course, this also means we need an initial xs, but as `ys ++ [] == ys`, we
can start off with the empty list.

-------------------------------------------------------------------------------}

toList :: AL a -> [a]
toList Empty = []
toList (Full as) = go as [] where
    go (One x) xs     = x : xs
    go (as :+: bs) xs = go as (go bs xs)

{-------------------------------------------------------------------------------

It is now hopefully easy to see that `toList` runs in linear time: we visit each
node in the tree exactly once, and the operations we do on the RHS of the
equations are either list construction or function calls, each of which take
constant time.

-------------------------------------------------------------------------------}

{-------------------------------------------------------------------------------

We have now arrived at our linear-time implementation of reverse:

-------------------------------------------------------------------------------}

reverse1 :: [a] -> [a]
reverse1 = toList . revAL . fromList

{-------------------------------------------------------------------------------

But, we could still object: do we *need* to go via the intermediate AL data
structure?  In fact, we do not.  We'll start by inlining the definitions into
reverse:

-------------------------------------------------------------------------------}

reverse2 :: [a] -> [a]
reverse2 = toList . revAL . fromList
    where toList :: AL a -> [a]
          toList Empty = []
          toList (Full as) = go as [] where
              go (One x) xs     = x : xs
              go (as :+: bs) xs = go as (go bs xs)

          revAL :: AL a -> AL a
          revAL Empty = Empty
          revAL (Full as) = Full (revAppl as)
          
          revAppl :: Appl a -> Appl a
          revAppl (One a) = One a
          revAppl (as :+: bs) = revAppl bs :+: revAppl as

          fromList :: [a] -> AL a
          fromList []  = Empty
          fromList xs  = Full (fromList' xs)
          
          fromList' :: [a] -> Appl a
          fromList' [x] = One x
          fromList' (x : xs) = One x :+: fromList' xs

-- Let's pull out the empty list case

reverse2' :: [a] -> [a]
reverse2' [] = []
reverse2' xs = (toList . revAppl . fromList) xs
    where toList as = go as [] where
              go (One x) xs     = x : xs
              go (as :+: bs) xs = go as (go bs xs)

          revAppl :: Appl a -> Appl a
          revAppl (One a) = One a
          revAppl (as :+: bs) = revAppl bs :+: revAppl as

          fromList :: [a] -> Appl a
          fromList [x] = One x
          fromList (x : xs) = One x :+: fromList xs

-- Now, we can *fuse* `revAppl` and `toList`: that is to say: we can observe
-- that we can reverse in the `go` function.

reverse2'' :: [a] -> [a]
reverse2'' [] = []
reverse2'' xs = (revToList . fromList) xs
    where revToList as = go as [] where
              go (One x) xs     = x : xs
              go (as :+: bs) xs = go bs (go as xs)

          fromList :: [a] -> Appl a
          fromList [x] = One x
          fromList (x : xs) = One x :+: fromList xs

-- Finally, we want to fuse `fromList` into `revToList`.  

reverse2''' :: [a] -> [a]
reverse2''' [] = []
reverse2''' xs = fromRevToList xs
    where fromRevToList as = go as [] where
              go [y] xs      = y : xs
              go (y : ys) xs = go ys (go [y] xs)

-- But now the `go [y]` case is really extraneous: rather than ever invoking
-- that case, we could just build the combined list.

reverse3 :: [a] -> [a]
reverse3 [] = []
reverse3 ys = go ys [] where
    go [] xs = xs
    go (y : ys) xs = go ys (y : xs)

-- Ruh-roh: a new base case emerged.  Why?    

main :: IO ()
main = return ()