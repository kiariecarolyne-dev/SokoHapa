# SokoHapa Master Product Images

This folder is the **single source of standard product images** for the SokoHapa master catalogue.

## Architecture

- One standard image per master product (never per vendor).
- One folder per master category:

```
assets/products/vegetables/
assets/products/fruits/
assets/products/cereals/
assets/products/legumes/
assets/products/roots/
assets/products/meat/
assets/products/dairy/
assets/products/fish/
assets/products/spices/
assets/products/nuts/
assets/products/other/
```

- Image filename is predictable: `<slug>.jpg`, where `slug` is the master product `productId`.
  Example: `assets/products/vegetables/tomato.jpg`, `assets/products/fruits/mango.jpg`, `assets/products/cereals/maize-grain.jpg`, `assets/products/meat/beef.jpg`.
- The master product record stores this exact path string in its `image` field
  (`src/services/masterProducts.js`), so images can be populated later **without changing the product database structure**.

## Current status

| Category | Images | Status |
| --- | --- | --- |
| vegetables | 38 / 38 | **STANDARD IMAGES DONE** |
| fruits | 26 / 26 | **STANDARD IMAGES DONE** |
| cereals | 15 / 15 | **STANDARD IMAGES DONE** |
| legumes | 14 / 14 | **STANDARD IMAGES DONE** |
| roots | 8 / 8 | **STANDARD IMAGES DONE** |
| meat | 17 / 18 | **17 DONE — goat-bones PENDING (no usable image)** |
| dairy | 13 / 13 | **STANDARD IMAGES DONE** |
| eggs | 4 / 4 | **STANDARD IMAGES DONE** |
| fish | 21 / 21 | **STANDARD IMAGES DONE** |
| spices | 30 / 30 | **STANDARD IMAGES DONE** |
| nuts | 18 / 18 | **STANDARD IMAGES DONE** |
| other | 31 / 31 | **STANDARD IMAGES DONE** |

For a pending image, `resolveProductImage(product)` in `src/utils/productCatalogue.js`
returns `null` and the UI must render an `ImagePlaceholder` instead of
`react-native` `<Image>`. Pending products still carry the correct expected
asset path in their `image` field (the file is simply not bundled yet).

## Vegetable images

The 38 vegetable standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. They are registered in `src/utils/productCatalogue.js` under the master
product slug, so every vendor listing the same product shows the same image.

### Attribution (Wikimedia Commons)

Slug → source file (see each link for the exact license and author):

| Product slug | Commons source file |
| --- | --- |
| tomato | [Fresh red tomatoes.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20red%20tomatoes.jpg) |
| onion | [Mixed onions.jpg](https://commons.wikimedia.org/wiki/File:Mixed%20onions.jpg) |
| red-onion | [Red Onion on White.JPG](https://commons.wikimedia.org/wiki/File:Red%20Onion%20on%20White.JPG) |
| spring-onion | [Bunches of spring onions 1.jpg](https://commons.wikimedia.org/wiki/File:Bunches%20of%20spring%20onions%201.jpg) |
| cabbage | [Fresh green cabbage heads.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20green%20cabbage%20heads.jpg) |
| kale | [Kale-Bundle.jpg](https://commons.wikimedia.org/wiki/File:Kale-Bundle.jpg) |
| spinach | [Fresh Spinach leaves.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20Spinach%20leaves.jpg) |
| amaranth-leaves | [Vegetables amaranth.jpg](https://commons.wikimedia.org/wiki/File:Vegetables%20amaranth.jpg) |
| cowpea-leaves | [Morogo wa dinawa.jpg](https://commons.wikimedia.org/wiki/File:Morogo%20wa%20dinawa.jpg) |
| pumpkin-leaves | [Fresh Pumpkin Leaves.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20Pumpkin%20Leaves.jpg) |
| african-nightshade | [Solanum villosum kz02.jpg](https://commons.wikimedia.org/wiki/File:Solanum%20villosum%20kz02.jpg) |
| spider-plant | [Cleome gynandra, handvormig-gelobde blare, Spitskop, a.jpg](https://commons.wikimedia.org/wiki/File:Cleome%20gynandra%2C%20handvormig-gelobde%20blare%2C%20Spitskop%2C%20a.jpg) |
| coriander-cilantro | [Cilantro from San Francisco Farmers Market.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Cilantro%20from%20San%20Francisco%20Farmers%20Market.jpg) |
| carrot | [Carrots at Ljubljana Central Market.JPG](https://commons.wikimedia.org/wiki/File:Carrots%20at%20Ljubljana%20Central%20Market.JPG) |
| green-pepper | [Poivrons Luc Viatour.jpg](https://commons.wikimedia.org/wiki/File:Poivrons%20Luc%20Viatour.jpg) |
| red-pepper | [Red bell pepper.jpg](https://commons.wikimedia.org/wiki/File:Red%20bell%20pepper.jpg) |
| green-chilli | [Green chillies variety.jpg](https://commons.wikimedia.org/wiki/File:Green%20chillies%20variety.jpg) |
| cucumber | [Fresh green cucumbers.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20green%20cucumbers.jpg) |
| courgette-zucchini | [Zucchini-Whole.jpg](https://commons.wikimedia.org/wiki/File:Zucchini-Whole.jpg) |
| eggplant-aubergine | [Eggplant.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Eggplant.jpg) |
| okra | [Okra or lady finger.jpg](https://commons.wikimedia.org/wiki/File:Okra%20or%20lady%20finger.jpg) |
| broccoli | [Fresh Broccoli.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Fresh%20Broccoli.jpg) |
| cauliflower | [Chou-fleur 02.jpg](https://commons.wikimedia.org/wiki/File:Chou-fleur%2002.jpg) |
| lettuce | [Lettuce Mini Heads (7331119710).jpg](https://commons.wikimedia.org/wiki/File:Lettuce%20Mini%20Heads%20(7331119710).jpg) |
| beetroot | [Beets - 9690511364.jpg](https://commons.wikimedia.org/wiki/File:Beets%20-%209690511364.jpg) |
| french-beans | [Macro of Fresh Green Beans Buncis.jpg](https://commons.wikimedia.org/wiki/File:Macro%20of%20Fresh%20Green%20Beans%20Buncis.jpg) |
| runner-beans | [Scarlet runner beans in a field - geograph.org.uk - 584764.jpg](https://commons.wikimedia.org/wiki/File:Scarlet%20runner%20beans%20in%20a%20field%20-%20geograph.org.uk%20-%20584764.jpg) |
| garden-peas | [Green pea pods.jpg](https://commons.wikimedia.org/wiki/File:Green%20pea%20pods.jpg) |
| snow-peas | [Pisum sativum var. macrocarpum Ilowiecki 2017-04-26 8700.jpg](https://commons.wikimedia.org/wiki/File:Pisum%20sativum%20var.%20macrocarpum%20Ilowiecki%202017-04-26%208700.jpg) |
| turnip | [Turnip 2622027.jpg](https://commons.wikimedia.org/wiki/File:Turnip%202622027.jpg) |
| radish | [A Bunch of Radishes 3D.JPG](https://commons.wikimedia.org/wiki/File:A%20Bunch%20of%20Radishes%203D.JPG) |
| leek | [Leek on white background - 0947.jpg](https://commons.wikimedia.org/wiki/File:Leek%20on%20white%20background%20-%200947.jpg) |
| celery | [Celery (177029685).jpeg](https://commons.wikimedia.org/wiki/File:Celery%20(177029685).jpeg) |
| butternut-squash | [Butternut Squash.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Butternut%20Squash.jpg) |
| pumpkin | [Pumpkins at Whole Foods in Sonoma - Sarah Stierch.jpg](https://commons.wikimedia.org/wiki/File:Pumpkins%20at%20Whole%20Foods%20in%20Sonoma%2C%20California%20-%20September%202022%20-%20Sarah%20Stierch.jpg) |
| mushroom | [WHITE MUSHROOM.jpg](https://commons.wikimedia.org/wiki/File:WHITE%20MUSHROOM.jpg) |
| sweet-corn | [Corn on the cob (sweet corn).jpg](https://commons.wikimedia.org/wiki/File:Corn%20on%20the%20cob%20(sweet%20corn).jpg) |
| baby-corn | [Baby corn (1).jpg](https://commons.wikimedia.org/wiki/File:Baby%20corn%20(1).jpg) |

Licensing note: each file is used under its Wikimedia Commons license (CC BY /
CC BY-SA / public domain, per-file). Before commercial release, review the
individual license pages above and keep per-file attribution (author + license)
in your app's credits screen as required.

## Fruit images

The 26 fruit standard images are real photos sourced from **Wikimedia Commons**
(freely licensed), center-cropped to 800x800 JPEG and optimized for mobile.
Registered in `src/utils/productCatalogue.js` under the master product slug.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| banana | [Bananas by the bunch - Carrara Market (2569636765).jpg](https://commons.wikimedia.org/wiki/File:Bananas%20by%20the%20bunch%20-%20Carrara%20Market%20(2569636765).jpg) |
| cooking-banana | [Plantains.jpg](https://commons.wikimedia.org/wiki/File:Plantains.jpg) |
| apple-banana | [Latundan banana.jpg](https://commons.wikimedia.org/wiki/File:Latundan%20banana.jpg) |
| mango | [Mango on white.jpg](https://commons.wikimedia.org/wiki/File:Mango%20on%20white.jpg) |
| avocado | [Branch and fruit of the Maluma avocado cultivar.jpg](https://commons.wikimedia.org/wiki/File:Branch%20and%20fruit%20of%20the%20Maluma%20avocado%20cultivar.jpg) |
| orange | [Oranges - whole-halved-segment.jpg](https://commons.wikimedia.org/wiki/File:Oranges%20-%20whole-halved-segment.jpg) |
| tangerine | [TangerineFruit.jpg](https://commons.wikimedia.org/wiki/File:TangerineFruit.jpg) |
| lemon | [Lemon Fruit.jpg](https://commons.wikimedia.org/wiki/File:Lemon%20Fruit.jpg) |
| lime | [Lime 01.jpg](https://commons.wikimedia.org/wiki/File:Lime%2001.jpg) |
| passion-fruit | [Passion fruits - whole and halved.jpg](https://commons.wikimedia.org/wiki/File:Passion%20fruits%20-%20whole%20and%20halved.jpg) |
| watermelon | [Whole Watermelon.jpg](https://commons.wikimedia.org/wiki/File:Whole%20Watermelon.jpg) |
| pawpaw-papaya | [Papaya raindrop.jpg](https://commons.wikimedia.org/wiki/File:Papaya%20raindrop.jpg) |
| pineapple | [Pineapple Fruit.jpg](https://commons.wikimedia.org/wiki/File:Pineapple%20Fruit.jpg) |
| guava | [Guava Fruit.jpg](https://commons.wikimedia.org/wiki/File:Guava%20Fruit.jpg) |
| jackfruit | [Artocarpus heterophyllus Fruit (8).jpg](https://commons.wikimedia.org/wiki/File:Artocarpus%20heterophyllus%20Fruit%20(8).jpg) |
| coconut | [Whole Coconut.jpg](https://commons.wikimedia.org/wiki/File:Whole%20Coconut.jpg) |
| tamarind | [Tamarind Pods (5201031112).jpg](https://commons.wikimedia.org/wiki/File:Tamarind%20Pods%20(5201031112).jpg) |
| tree-tomato | [Red tamarillo fruit.jpg](https://commons.wikimedia.org/wiki/File:Red%20tamarillo%20fruit.jpg) |
| grapes | [Bunch of grapes amidst vine leaves, Ponte de Sor - julesvernex2.jpg](https://commons.wikimedia.org/wiki/File:Bunch%20of%20grapes%20amidst%20vine%20leaves,%20Ponte%20de%20Sor%20(approx.%20GPS%20location)%20julesvernex2-2.jpg) |
| strawberry | [Garden Strawberries in Germany - edited.jpg](https://commons.wikimedia.org/wiki/File:Garden%20Strawberries%20in%20Germany%20-%20edited.jpg) |
| pear | [European Pear.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20European%20Pear.jpg) |
| peach | [Peach.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Peach.jpg) |
| plum | [Red-Plums.jpg](https://commons.wikimedia.org/wiki/File:Red-Plums.jpg) |
| melon | [Cantaloupe cut and whole.jpg](https://commons.wikimedia.org/wiki/File:Cantaloupe%20cut%20and%20whole.jpg) |
| dates | [Medjool-Date.jpg](https://commons.wikimedia.org/wiki/File:Medjool-Date.jpg) |
| dragon-fruit | [Dragon fruit (Pitaya).jpg](https://commons.wikimedia.org/wiki/File:Dragon%20fruit%20(Pitaya).jpg) |

## Cereal & grain images

The 15 cereal/grain standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| maize-grain | [Yellow corn kernels.jpg](https://commons.wikimedia.org/wiki/File:Yellow%20corn%20kernels.jpg) |
| green-maize | [Liat Portal for Foodie Disorder - Fresh Corn on the Cob.jpg](https://commons.wikimedia.org/wiki/File:Liat%20Portal%20for%20Foodie%20Disorder%20-%20Fresh%20Corn%20on%20the%20Cob.jpg) |
| maize-flour | [Corn flour (20240709).jpg](https://commons.wikimedia.org/wiki/File:Corn%20flour%20(20240709).jpg) |
| rice | [Thai jasmine rice uncooked.jpg](https://commons.wikimedia.org/wiki/File:Thai%20jasmine%20rice%20uncooked.jpg) |
| wheat | [Triticum aestivum subsp. aestivum MHNT.BOT.2015.2.31.jpg](https://commons.wikimedia.org/wiki/File:Triticum%20aestivum%20subsp.%20aestivum%20MHNT.BOT.2015.2.31.jpg) |
| wheat-flour | [Wheat-flour.jpg](https://commons.wikimedia.org/wiki/File:Wheat-flour.jpg) |
| sorghum | [Sorghum seed.jpg](https://commons.wikimedia.org/wiki/File:Sorghum%20seed.jpg) |
| finger-millet | [Ragi (Eleusine coracana) BNC.jpg](https://commons.wikimedia.org/wiki/File:Ragi%20(Eleusine%20coracana)%20BNC.jpg) |
| pearl-millet | [Pearl millet grain.jpg](https://commons.wikimedia.org/wiki/File:Pearl%20millet%20grain.jpg) |
| oats | [Uncooked oat groats.jpg](https://commons.wikimedia.org/wiki/File:Uncooked%20oat%20groats.jpg) |
| barley | [Hordeum vulgare MHNT.BOT.2015.2.39.jpg](https://commons.wikimedia.org/wiki/File:Hordeum%20vulgare%20MHNT.BOT.2015.2.39.jpg) |
| rye | [Rye grains rotated.jpg](https://commons.wikimedia.org/wiki/File:Rye%20grains%20rotated.jpg) |
| quinoa | [Quinoa closeup.jpg](https://commons.wikimedia.org/wiki/File:Quinoa%20closeup.jpg) |
| amaranth-grain | [Amaranth grain.jpg](https://commons.wikimedia.org/wiki/File:Amaranth%20grain.jpg) |
| popcorn | [Popcorn - Studio - 2011.jpg](https://commons.wikimedia.org/wiki/File:Popcorn%20-%20Studio%20-%202011.jpg) |

## Legume & pulse images

The 14 legume/pulse standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Accuracy guardrails followed: green grams = mung beans (≠ green peas);
cowpeas = cowpea seeds (not leaves); in Kenya, cowpeas generally appear as
patterned/speckled dry seeds, black-eyed peas as separate product; dolichos =
lablab (Njahi) seeds; pigeon peas = dried pigeon pea seeds; black beans = black
turtle beans.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| common-beans | [Phaseolus vulgaris MHNT.BOT.2016.24.73.jpg](https://commons.wikimedia.org/wiki/File:Phaseolus%20vulgaris%20MHNT.BOT.2016.24.73.jpg) |
| red-kidney-beans | [Red kidney beans (1).jpg](https://commons.wikimedia.org/wiki/File:Red%20kidney%20beans%20(1).jpg) |
| rosecoco-beans | [Rosecoco beans.jpg](https://commons.wikimedia.org/wiki/File:Rosecoco%20beans.jpg) |
| yellow-beans | [Maine Yellow Eye beans.jpg](https://commons.wikimedia.org/wiki/File:Maine%20Yellow%20Eye%20beans.jpg) |
| black-beans | [Black Turtle Bean.jpg](https://commons.wikimedia.org/wiki/File:Black%20Turtle%20Bean.jpg) |
| green-grams | [Mung beans (Vigna radiata).jpg](https://commons.wikimedia.org/wiki/File:Mung%20beans%20(Vigna%20radiata).jpg) |
| cowpeas | [Patterned cowpea (20240714).jpg](https://commons.wikimedia.org/wiki/File:Patterned%20cowpea%20(20240714).jpg) |
| pigeon-peas | [Pigeon peas dried.jpg](https://commons.wikimedia.org/wiki/File:Pigeon%20peas%20dried.jpg) |
| chickpeas | [Ordinary chickpeas in a ceramic bowl.jpg](https://commons.wikimedia.org/wiki/File:Ordinary%20chickpeas%20in%20a%20ceramic%20bowl.jpg) |
| lentils | [Lens culinaris seeds.jpg](https://commons.wikimedia.org/wiki/File:Lens%20culinaris%20seeds.jpg) |
| green-peas | [Pea-shelled.JPG](https://commons.wikimedia.org/wiki/File:Pea-shelled.JPG) |
| soya-beans | [Dried soybeans.jpg](https://commons.wikimedia.org/wiki/File:Dried%20soybeans.jpg) |
| dolichos-lablab | [Seeds of Lablab purpureus at Attapady in Kerala .jpg](https://commons.wikimedia.org/wiki/File:Seeds%20of%20Lablab%20purpureus%20at%20Attapady%20in%20Kerala%20.jpg) |
| black-eyed-peas | [BlackEyedPeas.JPG](https://commons.wikimedia.org/wiki/File:BlackEyedPeas.JPG) |

## Roots & tubers images

The 8 root/tuber standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Kenyan market distinction applied: cocoyam (Magimbi) = taro/Colocasia
corms; taro (Nduma) = tannia/Xanthosoma tubers; arrowroot (Nduma) = Maranta
rhizomes; each product uses a distinct, correct species photo.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| irish-potato | [Potato tubers in pail.jpg](https://commons.wikimedia.org/wiki/File:Potato%20tubers%20in%20pail.jpg) |
| sweet-potato | [Sweet potato in Nigeria.jpg](https://commons.wikimedia.org/wiki/File:Sweet%20potato%20in%20Nigeria.jpg) |
| cassava | [Harvested cassava roots 08.jpg](https://commons.wikimedia.org/wiki/File:Harvested%20cassava%20roots%2008.jpg) |
| arrowroot | [Arrowroot prep3.JPG](https://commons.wikimedia.org/wiki/File:Arrowroot%20prep3.JPG) |
| yam | [Yam tuber.jpg](https://commons.wikimedia.org/wiki/File:Yam%20tuber.jpg) |
| cocoyam | [Taro corms 2.jpg](https://commons.wikimedia.org/wiki/File:Taro%20corms%202.jpg) |
| taro | [Xanthosoma sagittifolium (20494380944).jpg](https://commons.wikimedia.org/wiki/File:Xanthosoma%20sagittifolium%20(20494380944).jpg) |
| ginger | [Ginger Root (Zingiber officinale).jpg](https://commons.wikimedia.org/wiki/File:Ginger%20Root%20(Zingiber%20officinale).jpg) |

## Meat & butchery images

The 17 available meat/butchery standard images are real photos sourced from
**Wikimedia Commons** (freely licensed), center-cropped to 800x800 JPEG and
optimized for mobile. Registered in `src/utils/productCatalogue.js` under the
master product slug. Accuracy guardrails: liver products use real raw liver
(per-species), kidney uses beef kidney (not liver), tripe uses tripe, offal
uses offal, minced beef is ground meat, bones use meaty bones.

**`goat-bones` is PENDING** — no legally reusable, accurately-labeled goat-bone
photograph was found on Wikimedia Commons (candidate titles were redirect
stubs or documents). Not substituted with any other animal's bones.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| beef | [Raw beef steak, 2011.jpg](https://commons.wikimedia.org/wiki/File:Raw%20beef%20steak,%202011.jpg) |
| goat-meat | [Goat chops.jpg](https://commons.wikimedia.org/wiki/File:Goat%20chops.jpg) |
| mutton | [Mutton chop.jpg](https://commons.wikimedia.org/wiki/File:Mutton%20chop.jpg) |
| chicken-meat | [CHICKEN BREAST.jpg](https://commons.wikimedia.org/wiki/File:CHICKEN%20BREAST.jpg) |
| indigenous-chicken | [Whole raw chicken - Japan Dec 22 2019.jpeg](https://commons.wikimedia.org/wiki/File:Whole%20raw%20chicken%20-%20Japan%20Dec%2022%202019.jpeg) |
| duck-meat | [Duck meat 1 2017-03-13.jpg](https://commons.wikimedia.org/wiki/File:Duck%20meat%201%202017-03-13.jpg) |
| turkey-meat | [Sliced turkey thigh.jpg](https://commons.wikimedia.org/wiki/File:Sliced%20turkey%20thigh.jpg) |
| beef-liver | [Beef liver.jpg](https://commons.wikimedia.org/wiki/File:Beef%20liver.jpg) |
| goat-liver | [Goat Liver and fat in a basin.jpg](https://commons.wikimedia.org/wiki/File:Goat%20Liver%20and%20fat%20in%20a%20basin.jpg) |
| chicken-liver | [Chicken Liver.jpg](https://commons.wikimedia.org/wiki/File:Chicken%20Liver.jpg) |
| beef-kidney | [BeefKidney-nyrky.jpg](https://commons.wikimedia.org/wiki/File:BeefKidney-nyrky.jpg) |
| beef-tripe | [Beef tripe.jpg](https://commons.wikimedia.org/wiki/File:Beef%20tripe.jpg) |
| goat-offal | [Goat Offal.JPG](https://commons.wikimedia.org/wiki/File:Goat%20Offal.JPG) |
| beef-offal | [Raw Offals.jpg](https://commons.wikimedia.org/wiki/File:Raw%20Offals.jpg) |
| beef-bones | [Beef bones.jpg](https://commons.wikimedia.org/wiki/File:Beef%20bones.jpg) |
| minced-beef | [Ground beef USDA.jpg](https://commons.wikimedia.org/wiki/File:Ground%20beef%20USDA.jpg) |
| sausages | [Raw sausages.jpg](https://commons.wikimedia.org/wiki/File:Raw%20sausages.jpg) |

## Dairy images

The 13 dairy standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Accuracy guardrails: yoghurt uses yoghurt, mala uses soured
(fermented/curdled) milk, drinking yoghurt is a drinkable yoghurt, cream uses
whipping cream, sour cream is cultured cream, cheese/cheddar are actual dairy
cheese, milk powder and condensed milk show the packaged powders/tins.

Note: existing egg products were re-homed from the former `dairy` (Eggs &
Dairy) category into the new `eggs` category, so egg images now live under
`assets/products/eggs/`.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| fresh-cow-milk | [Milk - olly claxton.jpg](https://commons.wikimedia.org/wiki/File:Milk%20-%20olly%20claxton.jpg) |
| fresh-goat-milk | [Goat milk in Perekrestok shop Perm 2023.jpg](https://commons.wikimedia.org/wiki/File:Goat%20milk%20in%20Perekrestok%20shop%20Perm%202023.jpg) |
| camel-milk | [Fresh camel milk (Dubai).jpg](https://commons.wikimedia.org/wiki/File:Fresh%20camel%20milk%20(Dubai).jpg) |
| yoghurt | [Joghurt.jpg](https://commons.wikimedia.org/wiki/File:Joghurt.jpg) |
| mala-fermented-milk | [Milk zsiadle.jpg](https://commons.wikimedia.org/wiki/File:Milk%20zsiadle.jpg) |
| drinking-yoghurt | [Korean yogurt drink-01.jpg](https://commons.wikimedia.org/wiki/File:Korean%20yogurt%20drink-01.jpg) |
| cream | [Whipping cream (3372596784).jpg](https://commons.wikimedia.org/wiki/File:Whipping%20cream%20(3372596784).jpg) |
| sour-cream | [Sour Cream.jpg](https://commons.wikimedia.org/wiki/File:Sour%20Cream.jpg) |
| butter | [2023 Masło w maselniczce.jpg](https://commons.wikimedia.org/wiki/File:2023%20Mas%C5%82o%20w%20maselniczce.jpg) |
| cheese | [Belper Mürggel B, WikiCheese Lausanne.jpg](https://commons.wikimedia.org/wiki/File:Belper%20M%C3%BCrggel%20B,%20WikiCheese%20Lausanne.jpg) |
| cheddar-cheese | [Somerset-Cheddar.jpg](https://commons.wikimedia.org/wiki/File:Somerset-Cheddar.jpg) |
| milk-powder | [PowderedMilk.jpg](https://commons.wikimedia.org/wiki/File:PowderedMilk.jpg) |
| condensed-milk | [Tin of condensed milk.jpg](https://commons.wikimedia.org/wiki/File:Tin%20of%20condensed%20milk.jpg) |

## Eggs images

The 4 egg standard images are real photos sourced from **Wikimedia Commons**
(freely licensed), center-cropped to 800x800 JPEG and optimized for mobile.
Registered in `src/utils/productCatalogue.js` under the master product slug.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| chicken-eggs | [Brown chicken eggs (1).jpg](https://commons.wikimedia.org/wiki/File:Brown%20chicken%20eggs%20(1).jpg) |
| indigenous-chicken-eggs | [Brown Eggs from Taiwan (1).jpg](https://commons.wikimedia.org/wiki/File:Brown%20Eggs%20from%20Taiwan%20(1).jpg) |
| duck-eggs | [Duck Eggs.jpg](https://commons.wikimedia.org/wiki/File:Duck%20Eggs.jpg) |
| quail-eggs | [Quail eggs (Перепелиные яйца).jpg](https://commons.wikimedia.org/wiki/File:Quail%20eggs%20(%D0%9F%D0%B5%D1%80%D0%B5%D0%BF%D0%B5%D0%BB%D0%B8%D0%BD%D1%8B%D0%B5%20%D1%8F%D0%B9%D1%86%D0%B0).jpg) |

## Fish & Seafood images

The 21 fish/seafood standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Accuracy guardrails: tilapia uses tilapia (not Nile perch), Nile perch
uses Nile perch (not tilapia), omena uses the local silver cyprinid
(`Rastrineobola argentea`) — NOT a generic sardine or anchovy, sardines use
sardines, tuna uses tuna from a fish market, mackerel uses Indian mackerel,
anchovies use anchovies, red snapper uses red snapper, catfish uses African
sharp-tooth catfish (`Clarias gariepinus`), kingfish uses king mackerel,
swordfish and marlin use whole billfish.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| tilapia | [Fresh Tilapia fish.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20Tilapia%20fish.jpg) |
| nile-perch | [Nile perch on Gaba landing site.jpg](https://commons.wikimedia.org/wiki/File:Nile%20perch%20on%20Gaba%20landing%20site.jpg) |
| omena-silver-cyprinid | [Silver Cyprinid or Dagaa, locally known as Omena.jpg](https://commons.wikimedia.org/wiki/File:Silver%20Cyprinid%20or%20Dagaa,%20locally%20known%20as%20Omena.jpg) |
| tuna | [Japan, Tokyo, Tsukiji fish market, tuna 01.jpg](https://commons.wikimedia.org/wiki/File:Japan,%20Tokyo,%20Tsukiji%20fish%20market,%20tuna%2001.jpg) |
| sardines | [Fresh Sardines.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20Sardines.jpg) |
| fresh-fish | [Lahug market fish stand January 2021.jpg](https://commons.wikimedia.org/wiki/File:Lahug%20market%20fish%20stand%20January%202021.jpg) |
| dried-fish | [Dried fish, Astrakhan market.jpg](https://commons.wikimedia.org/wiki/File:Dried%20fish,%20Astrakhan%20market.jpg) |
| prawns-shrimp | [Raw shrimp.jpg](https://commons.wikimedia.org/wiki/File:Raw%20shrimp.jpg) |
| crab | [Cancer pagurus.jpg](https://commons.wikimedia.org/wiki/File:Cancer%20pagurus.jpg) |
| octopus | ['Giant Octopus' sold at borough market..jpg](https://commons.wikimedia.org/wiki/File:%27Giant%20Octopus%27%20sold%20at%20borough%20market..jpg) |
| red-snapper | [Red Snapper.jpg](https://commons.wikimedia.org/wiki/File:Red%20Snapper.jpg) |
| mackerel | [Aylaa( Mackerel fish).jpg](https://commons.wikimedia.org/wiki/File:Aylaa(%20Mackerel%20fish).jpg) |
| salmon | [Raw salmon fillets.jpg](https://commons.wikimedia.org/wiki/File:Raw%20salmon%20fillets.jpg) |
| trout | [Rainbow Trout 2529.jpg](https://commons.wikimedia.org/wiki/File:Rainbow%20Trout%202529.jpg) |
| catfish | [Clarias gariepinus.jpg](https://commons.wikimedia.org/wiki/File:Clarias%20gariepinus.jpg) |
| kingfish | [King Mackerel.JPG](https://commons.wikimedia.org/wiki/File:King%20Mackerel.JPG) |
| anchovies | [Anchovy closeup.jpg](https://commons.wikimedia.org/wiki/File:Anchovy%20closeup.jpg) |
| herring | [Herring - Royal Fish, Markthal Rotterdam 2024-12-02.jpg](https://commons.wikimedia.org/wiki/File:Herring%20-%20Royal%20Fish,%20Markthal%20Rotterdam%202024-12-02.jpg) |
| cod | [Atlantic Cod, Atlantischer Kabeljau (Gadus morhua).jpg](https://commons.wikimedia.org/wiki/File:Atlantic%20Cod,%20Atlantischer%20Kabeljau%20(Gadus%20morhua).jpg) |
| swordfish | [Xiphias gladius 23056964.jpg](https://commons.wikimedia.org/wiki/File:Xiphias%20gladius%2023056964.jpg) |
| marlin | [Atlantic blue marlin.jpg](https://commons.wikimedia.org/wiki/File:Atlantic%20blue%20marlin.jpg) |

## Spices & Herbs images

The 30 spice/herb standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Accuracy guardrails: garlic is garlic bulbs, ginger is a fresh ginger
rhizome (distinct photo from the roots-category ginger), turmeric is turmeric
root/powder, black pepper is peppercorns, chilli is dried red chillies,
coriander seeds/cumin/cardamom/cinnamon/cloves/nutmeg/fenugreek use their own
authentic seeds/pods/sticks, curry/mixed/paprika/chilli/cayenne powders are
ground spice powders, salt is table salt, and the fresh herbs (coriander,
rosemary, mint, lemongrass, basil, thyme, parsley, oregano) are fresh bunches.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| garlic | [Garlic bulbs and cloves.jpg](https://commons.wikimedia.org/wiki/File:Garlic%20bulbs%20and%20cloves.jpg) |
| ginger-spice | [Zingiber officinale 230935597.jpg](https://commons.wikimedia.org/wiki/File:Zingiber%20officinale%20230935597.jpg) |
| turmeric | [Turmeric Root and Turmeric Powder.jpg](https://commons.wikimedia.org/wiki/File:Turmeric%20Root%20and%20Turmeric%20Powder.jpg) |
| black-pepper | [Black peppercorns gn.jpg](https://commons.wikimedia.org/wiki/File:Black%20peppercorns%20gn.jpg) |
| chilli | [Dried red chillies in Jaipur.jpg](https://commons.wikimedia.org/wiki/File:Dried%20red%20chillies%20in%20Jaipur.jpg) |
| coriander-seeds | [Coriander Seeds.jpg](https://commons.wikimedia.org/wiki/File:Coriander%20Seeds.jpg) |
| cumin | [Seeds of Cumin.jpg](https://commons.wikimedia.org/wiki/File:Seeds%20of%20Cumin.jpg) |
| cardamom | [Cardamom pods - Green BNC.jpg](https://commons.wikimedia.org/wiki/File:Cardamom%20pods%20-%20Green%20BNC.jpg) |
| cinnamon | [Cinnamon sticks (1).jpg](https://commons.wikimedia.org/wiki/File:Cinnamon%20sticks%20(1).jpg) |
| cloves | [Clove close up.jpg](https://commons.wikimedia.org/wiki/File:Clove%20close%20up.jpg) |
| nutmeg | [Nutmeg ready.jpg](https://commons.wikimedia.org/wiki/File:Nutmeg%20ready.jpg) |
| fenugreek | [Fenugreek Seeds 01.jpg](https://commons.wikimedia.org/wiki/File:Fenugreek%20Seeds%2001.jpg) |
| curry-powder | [Curry powder.jpg](https://commons.wikimedia.org/wiki/File:Curry%20powder.jpg) |
| bay-leaves | [Dried bay leaves (20240502).jpg](https://commons.wikimedia.org/wiki/File:Dried%20bay%20leaves%20(20240502).jpg) |
| fresh-coriander | [Coriander Leaves.jpg](https://commons.wikimedia.org/wiki/File:Coriander%20Leaves.jpg) |
| rosemary | [RosemarySprig.jpg](https://commons.wikimedia.org/wiki/File:RosemarySprig.jpg) |
| mint | [Mint leaves (Mentha spicata).jpg](https://commons.wikimedia.org/wiki/File:Mint%20leaves%20(Mentha%20spicata).jpg) |
| salt | [Comparison of Table Salt with Kitchen Salt.png](https://commons.wikimedia.org/wiki/File:Comparison%20of%20Table%20Salt%20with%20Kitchen%20Salt.png) |
| paprika | [Paprika Powder, Jan 2026.jpg](https://commons.wikimedia.org/wiki/File:Paprika%20Powder,%20Jan%202026.jpg) |
| chilli-powder | [Red Chili Powder (Lall Mirch) (49695826571).jpg](https://commons.wikimedia.org/wiki/File:Red%20Chili%20Powder%20(Lall%20Mirch)%20(49695826571).jpg) |
| cayenne-pepper | [Cayenne pepper condiment.jpg](https://commons.wikimedia.org/wiki/File:Cayenne%20pepper%20condiment.jpg) |
| mixed-spice | [Mixed Spices.jpg](https://commons.wikimedia.org/wiki/File:Mixed%20Spices.jpg) |
| star-anise | [Dried Star Anise Fruit Seeds.jpg](https://commons.wikimedia.org/wiki/File:Dried%20Star%20Anise%20Fruit%20Seeds.jpg) |
| fennel-seeds | [Fennel seeds 01.jpg](https://commons.wikimedia.org/wiki/File:Fennel%20seeds%2001.jpg) |
| mustard-seeds | [Mustard Seeds (Sarson) (49696132737).jpg](https://commons.wikimedia.org/wiki/File:Mustard%20Seeds%20(Sarson)%20(49696132737).jpg) |
| lemongrass | [Lemongrass Fresh.jpg](https://commons.wikimedia.org/wiki/File:Lemongrass%20Fresh.jpg) |
| basil | [Basil leaves.jpg](https://commons.wikimedia.org/wiki/File:Basil%20leaves.jpg) |
| thyme | [Thymus vulgaris 2601.JPG](https://commons.wikimedia.org/wiki/File:Thymus%20vulgaris%202601.JPG) |
| parsley | [Petroselinum crispum 003.JPG](https://commons.wikimedia.org/wiki/File:Petroselinum%20crispum%20003.JPG) |
| oregano | [Oregano dried.JPG](https://commons.wikimedia.org/wiki/File:Oregano%20dried.JPG) |

## Nuts & Seeds images

The 18 nut/seed standard images are real photos sourced from **Wikimedia
Commons** (freely licensed), center-cropped to 800x800 JPEG and optimized for
mobile. Registered in `src/utils/productCatalogue.js` under the master product
slug. Accuracy guardrails: peanuts are raw shelled peanuts, cashew/macadamia/
hazelnut/brazil/walnut are the actual nuts, sesame/pumpkin/sunflower/chia/flax/
hemp/poppy/watermelon seeds are their own seeds, roasted peanuts are roasted
(with shell), pistachios are pistachios, tiger nuts are chufa tubers.

### Attribution (Wikimedia Commons)

| Product slug | Commons source file |
| --- | --- |
| groundnuts-peanuts | [Peanuts (shelled raw marketed).jpg](https://commons.wikimedia.org/wiki/File:Peanuts%20(shelled%20raw%20marketed).jpg) |
| cashew-nuts | [CASHEW NUTS.jpg](https://commons.wikimedia.org/wiki/File:CASHEW%20NUTS.jpg) |
| macadamia-nuts | [Macadamia nuts.jpg](https://commons.wikimedia.org/wiki/File:Macadamia%20nuts.jpg) |
| sesame-seeds | [Sa white sesame seeds.jpg](https://commons.wikimedia.org/wiki/File:Sa%20white%20sesame%20seeds.jpg) |
| pumpkin-seeds | [Pumpkin Seeds macro 1.jpg](https://commons.wikimedia.org/wiki/File:Pumpkin%20Seeds%20macro%201.jpg) |
| sunflower-seeds | [Sunflower seeds. img 001.jpg](https://commons.wikimedia.org/wiki/File:Sunflower%20seeds.%20img%20001.jpg) |
| chia-seeds | [Chia seeds in a cup.jpg](https://commons.wikimedia.org/wiki/File:Chia%20seeds%20in%20a%20cup.jpg) |
| flax-seeds | [Brown Flax Seeds.jpg](https://commons.wikimedia.org/wiki/File:Brown%20Flax%20Seeds.jpg) |
| roasted-peanuts | [Roasted Peanuts (2019).jpg](https://commons.wikimedia.org/wiki/File:Roasted%20Peanuts%20(2019).jpg) |
| almonds | [Almonds 1.jpg](https://commons.wikimedia.org/wiki/File:Almonds%201.jpg) |
| walnuts | [Walnuts - whole and open with halved kernel.jpg](https://commons.wikimedia.org/wiki/File:Walnuts%20-%20whole%20and%20open%20with%20halved%20kernel.jpg) |
| pistachios | [Pistachio.jpg](https://commons.wikimedia.org/wiki/File:Pistachio.jpg) |
| hazelnuts | [Hazelnuts.jpg](https://commons.wikimedia.org/wiki/File:Hazelnuts.jpg) |
| brazil-nuts | [Bertholletia excelsa seeds closeup.jpg](https://commons.wikimedia.org/wiki/File:Bertholletia%20excelsa%20seeds%20closeup.jpg) |
| hemp-seeds | [Hemp seeds protein.jpg](https://commons.wikimedia.org/wiki/File:Hemp%20seeds%20protein.jpg) |
| poppy-seeds | [Poppy seeds.jpg](https://commons.wikimedia.org/wiki/File:Poppy%20seeds.jpg) |
| watermelon-seeds | [Watermelon Seeds.jpg](https://commons.wikimedia.org/wiki/File:Watermelon%20Seeds.jpg) |
| tiger-nuts | [Cyperus esculentus -Chufas.JPG](https://commons.wikimedia.org/wiki/File:Cyperus%20esculentus%20-Chufas.JPG) |

### Other Grocery images

All 800x800 JPEG, resized/cropped from Wikimedia Commons originals. Attribution: all images are
CC BY, CC BY-SA, CC0 or public-domain/own-work per their Commons file pages.

| slug | Source file |
| --- | --- |
| tomato-sauce | [Fresh Tomato Sauce (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Fresh%20Tomato%20Sauce%20(Unsplash).jpg) |
| tomato-paste | [Tomato paste on spoon.jpg](https://commons.wikimedia.org/wiki/File:Tomato%20paste%20on%20spoon.jpg) |
| ketchup | [Czech ketchup bottle.jpg](https://commons.wikimedia.org/wiki/File:Czech%20ketchup%20bottle.jpg) |
| peanut-butter | [Peanut butter glass.jpg](https://commons.wikimedia.org/wiki/File:Peanut%20butter%20glass.jpg) |
| fruit-jam | [Jam jar, Kazakhstan.jpg](https://commons.wikimedia.org/wiki/File:Jam%20jar,%20Kazakhstan.jpg) |
| chocolate-spread | [Chocolate Spread.jpg](https://commons.wikimedia.org/wiki/File:Chocolate%20Spread.jpg) |
| margarine | [Margarine.jpg](https://commons.wikimedia.org/wiki/File:Margarine.jpg) |
| cooking-oil | [Peanut oil bottle.jpg](https://commons.wikimedia.org/wiki/File:Peanut%20oil%20bottle.jpg) |
| sunflower-oil | [Sunflower oil and sunflower.jpg](https://commons.wikimedia.org/wiki/File:Sunflower%20oil%20and%20sunflower.jpg) |
| vegetable-oil | [2022-05-30 21 06 43 A bottle of Wesson vegetable oil in the Mountainville section of Ewing Township, Mercer County, New Jersey.jpg](https://commons.wikimedia.org/wiki/File:2022-05-30%2021%2006%2043%20A%20bottle%20of%20Wesson%20vegetable%20oil%20in%20the%20Mountainville%20section%20of%20Ewing%20Township,%20Mercer%20County,%20New%20Jersey.jpg) |
| sugar | [Sugar on a blue plate (close up).jpg](https://commons.wikimedia.org/wiki/File:Sugar%20on%20a%20blue%20plate%20(close%20up).jpg) |
| honey | [Honey jar (411317929).jpg](https://commons.wikimedia.org/wiki/File:Honey%20jar%20(411317929).jpg) |
| tea-leaves | [Loose Jasmine Tea Leaves.jpg](https://commons.wikimedia.org/wiki/File:Loose%20Jasmine%20Tea%20Leaves.jpg) |
| coffee | [Roasted coffee beans.jpg](https://commons.wikimedia.org/wiki/File:Roasted%20coffee%20beans.jpg) |
| bread | [Fresh made bread 06.jpg](https://commons.wikimedia.org/wiki/File:Fresh%20made%20bread%2006.jpg) |
| spaghetti | [Spaghetti (53257476437) (cropped).png](https://commons.wikimedia.org/wiki/File:Spaghetti%20(53257476437)%20(cropped).png) |
| macaroni | [Macaroni.png](https://commons.wikimedia.org/wiki/File:Macaroni.png) |
| instant-noodles | [Instant Noodles.jpg](https://commons.wikimedia.org/wiki/File:Instant%20Noodles.jpg) |
| biscuits | [Biscuits perspective.jpg](https://commons.wikimedia.org/wiki/File:Biscuits%20perspective.jpg) |
| vinegar | [Synthetic vinegar bottles.jpg](https://commons.wikimedia.org/wiki/File:Synthetic%20vinegar%20bottles.jpg) |
| mayonnaise | [Mayonnaise (1).jpg](https://commons.wikimedia.org/wiki/File:Mayonnaise%20(1).jpg) |
| baking-powder | [Backpulver RZ.jpg](https://commons.wikimedia.org/wiki/File:Backpulver%20RZ.jpg) |
| baking-soda | [Sodium bicarbonate.jpg](https://commons.wikimedia.org/wiki/File:Sodium%20bicarbonate.jpg) |
| stock-cubes | [Bouillon cube.jpg](https://commons.wikimedia.org/wiki/File:Bouillon%20cube.jpg) |
| coconut-milk | [Coconut milk from can01.JPG](https://commons.wikimedia.org/wiki/File:Coconut%20milk%20from%20can01.JPG) |
| drinking-water | [Bottled water.jpg](https://commons.wikimedia.org/wiki/File:Bottled%20water.jpg) |
| fruit-juice | [Orange juice 1 edit1.jpg](https://commons.wikimedia.org/wiki/File:Orange%20juice%201%20edit1.jpg) |
| soft-drinks | [Soft drinks.jpg](https://commons.wikimedia.org/wiki/File:Soft%20drinks.jpg) |
| canned-beans | [Canned beans.JPG](https://commons.wikimedia.org/wiki/File:Canned%20beans.JPG) |
| canned-tuna | [Kooddoo canned tuna.jpeg](https://commons.wikimedia.org/wiki/File:Kooddoo%20canned%20tuna.jpeg) |
| canned-sardines | [Moroccan canned sardines 001.jpg](https://commons.wikimedia.org/wiki/File:Moroccan%20canned%20sardines%20001.jpg) |

## How to add images for the remaining categories

1. Use an original photo (own photography) or a properly licensed image. **No hotlinking, no Google Image scraping, no unlicensed/copyrighted photos.**
2. Optimise/resize to roughly 800x800 px JPEG (max ~200 KB) so lists stay fast.
3. Drop it at `assets/products/<category>/<slug>.jpg`, matching the path already stored in the product record.
4. Register it in `src/utils/productCatalogue.js` (static `require()`), mirroring the vegetable entries.