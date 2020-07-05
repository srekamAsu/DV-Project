import json
import gzip

Test = False
false = False
true = True

def parse(path):
  g = gzip.open(path, 'r')
  for l in g:
    yield json.dumps(eval(l))

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
def readData(fileName):
    productReviews = {}
    count = 0
    for data in parse(fileName):
        data = json.loads(data.lower())
        if "overall" in data and "asin" in data:
            asin = data["asin"]
            if asin not in productReviews:
                productReviews[asin] = {}
                for month in months:
                    productReviews[asin][month] = 0
                productReviews[asin]["rating"] = []

            if "reviewtime" in data:
                month = months[int(data['reviewtime'].split(" ")[0])-1]
                productReviews[asin][month] += 1
            productReviews[asin]["rating"].append(data['overall'])
        count += 1
        if (count == 100 and Test):
            break
    print(count)
    return productReviews


def readMetaData(fileName, output_file, productReviews):
    count = 0
    MetaData = {}
    BrandMetaData = {}
    totalCategories= {}
    for data in parse(fileName):
        count += 1
        if (count == 100 and Test):
            break
        data = json.loads(data.lower())
        asin = data["asin"]
        if asin not in MetaData and asin in productReviews:
#             newObject = {}
#             newObject["Categories"] = []
            product_review = productReviews[asin]
            overall_rating = sum(product_review['rating']) / len(product_review['rating'])
            if "brand" in data:
                brand = data["brand"].replace("\n", "").replace("by", "").strip()
#             print(data)
#             if "main_cat" in data:
#                 totalCategories.add(data["main_cat"])
            if ("category" in data) and (len(data['category']) > 0):
                if brand != None and brand not in BrandMetaData:
                        BrandMetaData[brand] = {}
                        for month in months:
                            BrandMetaData[brand][month] = 0
                        BrandMetaData[brand]["count"] = 0
                        BrandMetaData[brand]["avg_rating"] = []
                BrandMetaData[brand]["avg_rating"].extend(product_review['rating'])
                BrandMetaData[brand]["count"] += len(product_review['rating'])
                for month in months:
                    BrandMetaData[brand][month] += product_review[month]
                for category in data['category']:
                    category = category.strip()
                    if len(category.split(" ")) < 4 and len(category) < 50:
                        if category not in totalCategories:
                            totalCategories[category] = {}
                            for month in months:
                                totalCategories[category][month] = 0
                            totalCategories[category]["avg_rating"] = []
                            totalCategories[category]["brands"] = {}
                            totalCategories[category]["count"] = 0
#                         newObject["Categories"].append(category)
                        if brand not in totalCategories[category]["brands"]:
                            totalCategories[category]["brands"][brand] = 0
                        totalCategories[category]["brands"][brand] += len(product_review['rating'])
                        totalCategories[category]["avg_rating"].extend(product_review['rating'])
                        totalCategories[category]["count"] += len(product_review['rating'])

                        for month in months:
                            totalCategories[category][month] += product_review[month]
#             MetaData[asin] = newObject
    BrandsData = []
    CategoriesData = []
    for category, categoryValue in dict(totalCategories).items():
        newCategory = {}
        if categoryValue['count'] > 10:
            newCategory["value"] = {}
            newCategory["value"]["avg_rating"] =  sum(categoryValue["avg_rating"]) / len(categoryValue["avg_rating"])
            newCategory["category"] = category

            newCategory["value"]["count"] = categoryValue['count']
            dateExtracted = {}
            for month in months:
                dateExtracted[month] = categoryValue[month]
            newCategory["value"]["dates"] = dateExtracted
            newCategory["value"]["brands"] = []
            for brand, brandValue in categoryValue["brands"].items():
                newBrand = {}
                newBrand["brand"] = brand
                newBrand["value"] = brandValue
                newCategory["value"]["brands"].append(newBrand)
            newCategory["value"]["brands"].sort(key=lambda x: x['value'], reverse=True)
            if (len(newCategory["value"]["brands"]) > 30):
                newCategory["value"]["brands"] = newCategory["value"]["brands"][:30]
            CategoriesData.append(newCategory)
    for brand, brandValue in dict(BrandMetaData).items():
        newBrand = {}
        if brandValue['count'] > 0:
            newBrand["value"] = {}
            newBrand["value"]["avg_rating"] =  sum(brandValue["avg_rating"]) / len(brandValue["avg_rating"])
            newBrand["brand"] = brand
            newBrand["value"]["count"] = brandValue['count']
            dateExtracted = {}
            for month in months:
                dateExtracted[month] = brandValue[month]
            newBrand["value"]["dates"] = dateExtracted
            BrandsData.append(newBrand)
    CategoriesData.sort(key=lambda x: x['value']['count'], reverse=True)
    BrandsData.sort(key=lambda x: x['value']['count'], reverse=True)
    categoryData = {}
    if len(BrandsData) > 200:
        categoryData["brands"] = BrandsData[:200]
    else:
        categoryData["brands"] = BrandsData

    if len(CategoriesData) > 200:
        categoryData["category"] = CategoriesData[:200]
    else:
        categoryData["category"] = CategoriesData

    print(len(categoryData), " length shoud be 2")
    with open(output_file, 'w') as f:
        json.dump(categoryData, f)

#     print(BrandMetaData)
def sportsDataExtraction():
    sportsFileName = "../RawData/Sports_and_Outdoors.json.gz"
    sportsMetaFileName = "../RawData/meta_Sports_and_Outdoors.json.gz"
    sports_brand = "../data/sports_and_outdoors.json"
    productReviews = readData(sportsFileName)
    print(len(productReviews), " is prodcuts length")
    readMetaData(sportsMetaFileName, sports_brand, productReviews)

def fashionDataExtraction():
    fashionFileName = "../RawData/Clothing_Shoes_and_Jewelry.json.gz"
    fashionMetaFileName = "../RawData/meta_Clothing_Shoes_and_Jewelry.json.gz"
    fashion_brand = "../data/cloathing_and_jewelery.json"
    productReviews = readData(fashionFileName)
    print(len(productReviews), " is prodcuts length")
    readMetaData(fashionMetaFileName, fashion_brand, productReviews)

def beautyDataExtraction():
    beautyFileName = "../RawData/All_Beauty.json.gz"
    beautyMetaFileName = "../RawData/meta_All_Beauty.json.gz"
    beautyOutputFile = "../data/beauty.json"
    productReviews = readData(beautyFileName)
    print(len(productReviews), " is beauty prodcuts length")
    readMetaData(beautyMetaFileName, beautyOutputFile, productReviews)


def appliancesDataExtraction():
    beautyFileName = "../RawData/Appliances.json.gz"
    beautyMetaFileName = "../RawData/meta_Appliances.json.gz"
    beautyOutputFile = "../data/appliances.json"
    productReviews = readData(beautyFileName)
    print(len(productReviews), " is appliances prodcuts length")
    readMetaData(beautyMetaFileName, beautyOutputFile, productReviews)

def main():
    beautyDataExtraction()
    appliancesDataExtraction()


if __name__ == "__main__":
    main()
